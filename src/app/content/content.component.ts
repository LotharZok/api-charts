import { Component } from '@angular/core';
import { API_KEY } from './content.constants';
import { Chart } from 'chart.js/auto';

@Component({
    selector: 'app-content',
    templateUrl: './content.component.html',
    styleUrls: ['./content.component.scss']
})
export class ContentComponent {
    title = 'API Chart';
    btcRate: number = 0;
    chart: any = [];
    chartLabels: string[] = [];
    chartData: number[] = [];
    chartLow: number[] = [];
    chartHigh: number[] = [];
    chartLowHigh: number[][] = [];
    curDate: string = new Date().toDateString();

    constructor() {
        // console.log(API_KEY);
        this.loadRate();
    }


    async loadRate() {
        let url = 'https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=BTC&to_currency=EUR&apikey=' + API_KEY;
        let response = await fetch(url);
        let responseAsJson = await response.json(); 
        this.btcRate = Math.round(responseAsJson['Realtime Currency Exchange Rate']['5. Exchange Rate']);

        this.loadMonthlyRates();
    }


    async loadMonthlyRates() {
        let url = 'https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_MONTHLY&symbol=BTC&market=EUR&apikey=' + API_KEY;
        let response = await fetch(url);
        let responseAsJson = await response.json();
        console.log('Exchange rate: ', responseAsJson['Time Series (Digital Currency Monthly)']);
        let keysArray = Object.keys(responseAsJson['Time Series (Digital Currency Monthly)']);

        for (let i = keysArray.length - 1; i >= 0; i--) {

            const elem = keysArray[i];
            const rateEachMonth = responseAsJson['Time Series (Digital Currency Monthly)'][elem];
            // console.log('Rate ' + elem + ': ', rateEachMonth);
            const closeRate = rateEachMonth['4a. close (EUR)'];
            // console.log('Closing rate ' + elem + ': ', closeRate);
            let lowHigh:number[] = [rateEachMonth['2a. high (EUR)'], rateEachMonth['3a. low (EUR)']];
            console.log(lowHigh);
    
            this.chartLabels.push(elem);
            this.chartData.push(closeRate);
            this.chartHigh.push(rateEachMonth['2a. high (EUR)']);
            this.chartLow.push(rateEachMonth['3a. low (EUR)']);
            // console.log(this.chartLabels);
            // console.log(this.chartData);
            // this.chartLowHigh = [this.chartLow, this.chartHigh];
            this.chartLowHigh.push(lowHigh);
        }
        console.log(this.chartLowHigh);
        this.drawChart()
    }


    drawChart() {
        this.chart = new Chart('canvas', {
            // type: 'line',
            data: {
                labels: this.chartLabels,
                datasets: [
                    {
                        type: 'line',
                        label: 'Closing rate',
                        data: this.chartData,
                        borderWidth: 1,
                    },
                    {
                        type: 'bar',
                        label: 'min. rate',
                        data: this.chartLow,
                        borderWidth: 1,
                    },
                    {
                        type: 'bar',
                        label: 'max. rate',
                        data: this.chartHigh,
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });

        // this.chart = new Chart('canvas', {
        //     type: 'bar',
        //     data: this.chartLowHigh,
        //     options: {
        //         responsive: true,
        //         plugins: {
        //             legend: {
        //                 position: 'top',
        //             },
        //             title: {
        //                 display: true,
        //                 text: 'Chart.js Floating Bar Chart'
        //             }
        //         }
        //     }
        // })
    }
}

