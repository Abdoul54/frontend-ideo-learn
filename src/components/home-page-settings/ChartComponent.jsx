'use client';
import React from 'react';
import dynamic from 'next/dynamic';

// Import the chart component with dynamic import and no SSR
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '150px', height: '189px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '150px', height: '150px', borderRadius: '50%', backgroundColor: '#f5f5f5' }}></div>
    </div>
  )
});

// Separate chart component to prevent SSR issues
const ChartComponent = ({ options }) => {
  // Chart series data
  const series = [23, 35, 10, 20, 35, 23];

  return (
    <div style={{ width: '150px', height: '189px' }}>
      {/* Only render the chart on client side */}
      <ReactApexChart
        type='donut'
        height={189}
        width={150}
        options={options}
        series={series}
      />
    </div>
  );
};

export default ChartComponent;