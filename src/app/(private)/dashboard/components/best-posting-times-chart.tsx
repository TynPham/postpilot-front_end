'use client'

import { useCallback, useRef } from 'react'
import { format } from 'date-fns'
import html2canvas from 'html2canvas-pro'
import { Download } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { Statistical } from '@/types/utils'
import { Button } from '@/components/ui/button'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const chartConfig = {
  engagement: {
    label: 'Engagement',
    color: 'hsl(var(--chart-1))'
  }
} satisfies ChartConfig

export function BestPostingTimesChart({ data }: { data: Statistical['postsByTimeRange'] }) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    time: key,
    engagement: value
  }))

  const chartRef = useRef<HTMLDivElement>(null)

  const handleExportChart = useCallback(async () => {
    if (chartRef.current) {
      // Get the chart's dimensions
      const chartRect = chartRef.current.getBoundingClientRect()

      // Get the actual background color
      const bgColor = window.getComputedStyle(document.body).backgroundColor

      // Calculate padding to center the chart
      const padding = 20
      const width = chartRect.width + padding * 2
      const height = chartRect.height + padding * 2

      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: bgColor,
        scale: 1,
        width,
        height,
        x: -padding,
        y: -padding
      })
      const link = document.createElement('a')
      link.download = `best-posting-times-${format(new Date(), 'yyyy-MM-dd')}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
  }, [])

  return (
    <div className='relative'>
      <div className='absolute -top-16 right-0 z-10'>
        <Button variant='outline' size='icon' onClick={handleExportChart} title='Export as image'>
          <Download className='size-4' />
        </Button>
      </div>
      <div ref={chartRef}>
        <ChartContainer config={chartConfig} className='w-full max-h-96'>
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey='time' tickLine={false} tickMargin={10} axisLine={false} interval={0} className='text-xs' />
            <YAxis
              tickFormatter={(value) => `${value.toLocaleString()}`}
              className='text-xs'
              allowDecimals={false}
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey='engagement' fill='var(--color-engagement)' radius={8} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  )
}
