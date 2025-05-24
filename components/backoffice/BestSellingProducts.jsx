'use client'
import React, { useState, useEffect } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function BestSellingProducts() {
    const [categoryData, setCategoryData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Sales',
                data: [],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(255, 105, 180, 0.7)',
                    'rgba(50, 205, 50, 0.7)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 105, 180, 1)',
                    'rgba(50, 205, 50, 1)',
                ],
                borderWidth: 1,
            },
        ],
    });
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        // First fetch the categories to get proper names
        const fetchCategories = async () => {
            try {
                console.log('Fetching categories...');
                const response = await fetch('/api/admin/categories');
                
                if (!response.ok) {
                    throw new Error('Failed to fetch categories');
                }
                
                const data = await response.json();
                console.log('Categories data:', data);
                
                if (data.categories && Array.isArray(data.categories)) {
                    setCategories(data.categories);
                } else {
                    console.error('Invalid categories data format:', data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                toast.error('Failed to load categories');
            }
        };

        // Then fetch sales data and combine with category names
        const fetchSalesData = async () => {
            try {
                setLoading(true);
                await fetchCategories(); // First get categories
                
                // Then get sales data
                const response = await fetch('/api/admin/dashboard/categories-summary');
                
                if (!response.ok) {
                    throw new Error('Failed to fetch category sales data');
                }
                
                const data = await response.json();
                console.log('Sales data:', data);
                
                if (data.categories && Array.isArray(data.categories)) {
                    // Match with proper category names from categories API
                    const categoriesWithNames = data.categories.map(salesItem => {
                        // Find matching category from our categories list
                        const matchingCategory = categories.find(cat => cat.id === salesItem.id);
                        return {
                            ...salesItem,
                            // Use the proper name from categories API if available
                            name: matchingCategory ? matchingCategory.name : salesItem.name
                        };
                    });
                    
                    // Take top 8 for chart
                    const topCategories = categoriesWithNames.slice(0, 8);
                    console.log('Top categories with proper names:', topCategories);
                    
                    // Update chart data
                    setCategoryData({
                        labels: topCategories.map(cat => cat.name || 'Unknown Category'),
                        datasets: [
                            {
                                label: 'Sales',
                                data: topCategories.map(cat => Number(cat.totalSales || 0)),
                                backgroundColor: [
                                    'rgba(255, 99, 132, 0.7)',
                                    'rgba(54, 162, 235, 0.7)',
                                    'rgba(255, 206, 86, 0.7)',
                                    'rgba(75, 192, 192, 0.7)',
                                    'rgba(153, 102, 255, 0.7)',
                                    'rgba(255, 159, 64, 0.7)',
                                    'rgba(255, 105, 180, 0.7)',
                                    'rgba(50, 205, 50, 0.7)',
                                ],
                                borderColor: [
                                    'rgba(255, 99, 132, 1)',
                                    'rgba(54, 162, 235, 1)',
                                    'rgba(255, 206, 86, 1)',
                                    'rgba(75, 192, 192, 1)',
                                    'rgba(153, 102, 255, 1)',
                                    'rgba(255, 159, 64, 1)',
                                    'rgba(255, 105, 180, 1)',
                                    'rgba(50, 205, 50, 1)',
                                ],
                                borderWidth: 1,
                            },
                        ],
                    });
                } else {
                    console.error('Invalid category sales data:', data);
                    useFallbackData();
                }
            } catch (error) {
                console.error('Error in fetchSalesData:', error);
                toast.error('Failed to load sales data');
                useFallbackData();
            } finally {
                setLoading(false);
            }
        };
        
        const useFallbackData = () => {
            const fallbackCategories = [
                { name: 'Writing Tools', totalSales: 4500 },
                { name: 'Paper Products', totalSales: 3800 },
                { name: 'Books & Stories', totalSales: 3200 },
                { name: 'Office Supplies', totalSales: 2900 },
                { name: 'Art/Craft Supplies', totalSales: 2100 },
                { name: 'School Supplies', totalSales: 1900 },
                { name: 'Technology & Accessories', totalSales: 1500 },
                { name: 'Gifts & Games', totalSales: 900 }
            ];
            
            setCategoryData({
                labels: fallbackCategories.map(cat => cat.name),
                datasets: [
                    {
                        label: 'Sales',
                        data: fallbackCategories.map(cat => cat.totalSales),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.7)',
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(255, 206, 86, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(153, 102, 255, 0.7)',
                            'rgba(255, 159, 64, 0.7)',
                            'rgba(255, 105, 180, 0.7)',
                            'rgba(50, 205, 50, 0.7)',
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)',
                            'rgba(255, 105, 180, 1)',
                            'rgba(50, 205, 50, 1)',
                        ],
                        borderWidth: 1,
                    },
                ],
            });
        };

        fetchSalesData();
    }, [categories.length]);

    const options = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const value = context.raw;
                        return `${context.label}: ${value.toLocaleString()} TND`;
                    }
                }
            },
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            }
        }
    };

    return (
        <div className='bg-slate-50 shadow-xl dark:bg-slate-700 p-8 rounded-lg'>
            <h2 className='text-xl font-bold mb-4 text-slate-800 dark:text-slate-50'>Best Selling Charts</h2>
            
            <div className="p-4">
                {loading ? (
                    <div className="flex items-center justify-center h-80">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
                    </div>
                ) : (
                    <Pie data={categoryData} options={options} />
                )}
            </div>
        </div>
    )
}
