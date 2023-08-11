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
    btcRate: number = 0;                          // current Bitcoin rate - used in html file
    chart: any = [];                              // will contain the chart itself - used in html file
    chartLabels: string[] = [];
    chartData: number[] = [];
    chartLow: number[] = [];
    chartHigh: number[] = [];
    // Test-Variable for a floating bars chart (doesn't work)
    // chartLowHigh: number[][] = [];
    curDate: string = new Date().toDateString();  // the current date - used in html file

    /**
     * Constructor: Starts loading of the rates
     */
    constructor() {
        // console.log(API_KEY);
        this.loadRate();
    }


    /**
     * Loads the current Bitcoin rate and starts loading of historical data.
     */
    async loadRate() {
        let url = 'https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=BTC&to_currency=EUR&apikey=' + API_KEY;
        let response = await fetch(url);
        let responseAsJson = await response.json(); 
        this.btcRate = Math.round(responseAsJson['Realtime Currency Exchange Rate']['5. Exchange Rate']);

        this.loadMonthlyRates();
    }


    /**
     * Loads the historical Bitcoins rates and calls the function to draw the chart.
     */
    async loadMonthlyRates() {
        let url = 'https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_MONTHLY&symbol=BTC&market=EUR&apikey=' + API_KEY;
        let response = await fetch(url);
        let responseAsJson = await response.json();
        // console.log('Exchange rate: ', responseAsJson['Time Series (Digital Currency Monthly)']);
        let keysArray = Object.keys(responseAsJson['Time Series (Digital Currency Monthly)']);

        for (let i = keysArray.length - 1; i >= 0; i--) {

            const elem = keysArray[i];
            const rateEachMonth = responseAsJson['Time Series (Digital Currency Monthly)'][elem];
            const closeRate = rateEachMonth['4a. close (EUR)'];
            // Test-Variable for a floating bars chart (doesn't work)
            // let lowHigh:number[] = [rateEachMonth['2a. high (EUR)'], rateEachMonth['3a. low (EUR)']];
    
            this.chartLabels.push(elem);
            this.chartData.push(closeRate);
            this.chartHigh.push(rateEachMonth['2a. high (EUR)']);
            this.chartLow.push(rateEachMonth['3a. low (EUR)']);
            // Test-Variable for a floating bars chart (doesn't work)
            // this.chartLowHigh.push(lowHigh);
        }
        this.drawChart()
    }


    /**
     * Draws the chart using techniques from chart.js
     */
    drawChart() {
        this.chart = new Chart('canvas', {
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

        // Floating chart doesn't work, therefor the following test part is deactivated

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