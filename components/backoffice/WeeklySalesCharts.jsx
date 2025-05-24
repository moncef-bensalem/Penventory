'use client'
import React, { useState, useEffect } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import toast from 'react-hot-toast';

export default function WeeklySalesCharts() {
    // Register Chart.js components
    ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend
    );

    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState({
        sales: {
            labels: [],
            datasets: [{
                label: 'Sales',
                data: [],
                borderColor: 'rgb(22, 163, 74)',
                backgroundColor: 'rgba(22, 163, 74, 0.5)',
            }]
        },
        orders: {
            labels: [],
            datasets: [{
                label: 'Orders',
                data: [],
                borderColor: 'rgb(251, 146, 60)',
                backgroundColor: 'rgba(251, 146, 60, 0.5)',
            }]
        }
    });

    const [chartToDisplay, setChartToDisplay] = useState('sales');

    // Ajout d'un état pour la période sélectionnée
    const [selectedPeriod, setSelectedPeriod] = useState('week');
    
    // Fonction pour générer des données aléatoires pour les graphiques
    const generateRandomData = (period) => {
        setLoading(true);
        
        // Obtenir les dates en fonction de la période
        const now = new Date();
        let startDate;
        let dates = [];
        
        switch (period) {
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                // Générer 7 jours
                for (let i = 0; i < 7; i++) {
                    const date = new Date(startDate);
                    date.setDate(startDate.getDate() + i);
                    dates.push(date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }));
                }
                break;
            case 'month':
                startDate = new Date(now);
                startDate.setMonth(now.getMonth() - 1);
                // Générer 30 jours
                for (let i = 0; i < 30; i++) {
                    const date = new Date(startDate);
                    date.setDate(startDate.getDate() + i);
                    dates.push(date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }));
                }
                break;
            case 'year':
                startDate = new Date(now);
                startDate.setFullYear(now.getFullYear() - 1);
                // Générer 12 mois
                for (let i = 0; i < 12; i++) {
                    const date = new Date(startDate);
                    date.setMonth(startDate.getMonth() + i);
                    dates.push(date.toLocaleDateString('fr-FR', { month: 'short' }));
                }
                break;
            default:
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                for (let i = 0; i < 7; i++) {
                    const date = new Date(startDate);
                    date.setDate(startDate.getDate() + i);
                    dates.push(date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }));
                }
        }
        
        // Générer des valeurs aléatoires pour les ventes
        const salesValues = dates.map(() => {
            // Valeurs entre 500 et 5000 pour les ventes quotidiennes
            if (period === 'year') {
                return Math.floor(Math.random() * 45000) + 5000; // 5000-50000 pour les mois
            } else {
                return Math.floor(Math.random() * 4500) + 500; // 500-5000 pour les jours
            }
        });
        
        // Générer des valeurs aléatoires pour les commandes (environ 1/10 des ventes)
        const ordersValues = salesValues.map(value => {
            return Math.floor(value / (Math.random() * 8 + 7));
        });
        
        setChartData({
            sales: {
                labels: dates,
                datasets: [{
                    label: 'Sales',
                    data: salesValues,
                    borderColor: 'rgb(22, 163, 74)',
                    backgroundColor: 'rgba(22, 163, 74, 0.5)',
                }]
            },
            orders: {
                labels: dates,
                datasets: [{
                    label: 'Orders',
                    data: ordersValues,
                    borderColor: 'rgb(251, 146, 60)',
                    backgroundColor: 'rgba(251, 146, 60, 0.5)',
                }]
            }
        });
        
        setLoading(false);
    };
    
    // Fonction pour récupérer les données de ventes (maintenant utilise generateRandomData)
    const fetchSalesData = async (period) => {
        // Pour le développement, générer des données aléatoires directement
        // Cela garantit que les données changent à chaque rafraîchissement
        generateRandomData(period);
        
        // Si vous souhaitez réactiver l'API plus tard, décommentez ce code
        /*
        try {
            setLoading(true);
            // Fetch sales data for the selected period
            const response = await fetch(`/api/admin/dashboard/revenue-chart?period=${period}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch sales data');
            }
            
            const data = await response.json();
            
            if (data && data.data) {
                // Extract labels and values from the API response
                const labels = data.data.map(item => item.date);
                const salesValues = data.data.map(item => item.value);
                
                // Fetch orders data separately for more accurate data
                const ordersResponse = await fetch(`/api/admin/dashboard/orders-chart?period=${period}`);
                let ordersValues = [];
                
                if (ordersResponse.ok) {
                    const ordersData = await ordersResponse.json();
                    if (ordersData && ordersData.data) {
                        ordersValues = ordersData.data.map(item => item.count);
                    }
                } else {
                    // Fallback: Create approximate orders if API fails
                    ordersValues = data.data.map(item => 
                        Math.round(item.value / (Math.random() * 5 + 3))
                    );
                }
                
                setChartData({
                    sales: {
                        labels,
                        datasets: [{
                            label: 'Sales',
                            data: salesValues,
                            borderColor: 'rgb(22, 163, 74)',
                            backgroundColor: 'rgba(22, 163, 74, 0.5)',
                        }]
                    },
                    orders: {
                        labels,
                        datasets: [{
                            label: 'Orders',
                            data: ordersValues,
                            borderColor: 'rgb(251, 146, 60)',
                            backgroundColor: 'rgba(251, 146, 60, 0.5)',
                        }]
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching sales data:', error);
            toast.error('Failed to load sales data');
            // Fallback to random data on error
            generateRandomData(period);
        } finally {
            setLoading(false);
        }
        */
    };

    // Effet pour récupérer les données lors du chargement initial et lors du changement de période
    useEffect(() => {
        fetchSalesData(selectedPeriod);
        
        // Configurer un intervalle pour rafraîchir les données toutes les 5 minutes
        const refreshInterval = setInterval(() => {
            fetchSalesData(selectedPeriod);
        }, 5 * 60 * 1000); // 5 minutes en millisecondes
        
        // Nettoyer l'intervalle lors du démontage du composant
        return () => clearInterval(refreshInterval);
    }, [selectedPeriod]);
    
    // Fonction pour gérer le changement de période
    const handlePeriodChange = (period) => {
        setSelectedPeriod(period);
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: false,
                text: 'Chart.js Line Chart',
            },
        },
    };

    const tabs = [
        {
            title: "Sales",
            type: "sales",
            data: chartData.sales,
            icon: (
                <svg className="w-4 h-4 me-2 text-green-600 dark:text-green-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18">
                    <path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z"/>
                </svg>),
            activeColor: "text-green-600 border-green-600 dark:text-green-500 dark:border-green-500",
        },
        {
            title: "Orders",
            type: "orders",
            data: chartData.orders,
            icon: (
                <svg className="w-4 h-4 me-2 text-orange-400 group-hover:text-orange-500 dark:text-orange-500 dark:group-hover:text-orange-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                    <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z"/>
                </svg>),
            activeColor: "text-orange-600 border-orange-600 dark:text-orange-500 dark:border-orange-500",
        },
    ];

    return (
        <div className='bg-slate-50 shadow-xl dark:bg-slate-700 p-8 rounded-lg'>
            <div className="flex justify-between items-center mb-4">
                <h2 className='text-xl font-bold text-slate-800 dark:text-slate-50'>
                    {selectedPeriod === 'week' ? 'Weekly' : selectedPeriod === 'month' ? 'Monthly' : 'Yearly'} Sales
                </h2>
                <div className="flex space-x-2">
                    <button 
                        onClick={() => handlePeriodChange('week')} 
                        className={`px-3 py-1 rounded-md text-sm ${selectedPeriod === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200'}`}
                    >
                        Week
                    </button>
                    <button 
                        onClick={() => handlePeriodChange('month')} 
                        className={`px-3 py-1 rounded-md text-sm ${selectedPeriod === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200'}`}
                    >
                        Month
                    </button>
                    <button 
                        onClick={() => handlePeriodChange('year')} 
                        className={`px-3 py-1 rounded-md text-sm ${selectedPeriod === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200'}`}
                    >
                        Year
                    </button>
                    <button 
                        onClick={() => fetchSalesData(selectedPeriod)} 
                        className="px-3 py-1 rounded-md text-sm bg-green-600 text-white hover:bg-green-700 flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>
            </div>
            <div className="p-4">
                {/* Tabs */}
                <div className="border-b border-gray-400 dark:border-gray-300">
                    <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-200 dark:text-gray-400">
                        {
                            tabs.map((tab, i) => (
                                <li className="me-2" key={i}>
                                    <button
                                        onClick={() => setChartToDisplay(tab.type)}
                                        className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group 
                                            ${chartToDisplay === tab.type
                                                ? tab.activeColor
                                                : "border-transparent text-slate-800 dark:text-slate-500 hover:text-gray-300 hover:border-gray-100 dark:hover:text-gray-100"
                                            }`}
                                    >
                                        {tab.icon}
                                        {tab.title}
                                    </button>
                                </li>
                            ))
                        }
                    </ul>
                </div>

                {/* Content to display */}
                {loading ? (
                    <div className="flex items-center justify-center h-80">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
                    </div>
                ) : (
                    tabs.map((tab, i) => (
                        chartToDisplay === tab.type ? (
                            <Line key={i} options={options} data={tab.data} />
                        ) : null
                    ))
                )}
            </div>
        </div>
    );
}