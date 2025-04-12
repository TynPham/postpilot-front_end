import { PostSchema } from '@/schema-validations/post'
import { addMonths, format, isAfter, isBefore } from 'date-fns'
import { Calendar, CalendarIcon, Upload } from 'lucide-react'
import moment from 'moment'
import { UseFormReturn } from 'react-hook-form'

import { cn } from '@/lib/utils'
import { useRecurringSchedule } from '@/hooks/use-recurring-schedule'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import AppInput from '@/components/app-input'

interface FormPanelProps {
  form: UseFormReturn<PostSchema>
  recurringSchedule: ReturnType<typeof useRecurringSchedule>
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const FormPanel = ({ form, recurringSchedule, onImageUpload }: FormPanelProps) => {
  const {
    isRecurring,
    setIsRecurring,
    recurringType,
    setRecurringType,
    recurringDays,
    setRecurringDays,
    dateRange,
    dateRangeOpen,
    setDateRangeOpen,
    handleDateRangeSelect
  } = recurringSchedule

  const weekdays = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ]

  return (
    <div className='flex-1'>
      <div className='p-6 max-h-[calc(90vh-48px)] overflow-y-auto scrollbar-none'>
        <div className='space-y-6'>
          <FormField
            control={form.control}
            name='type'
            render={({ field }) => (
              <FormItem className='space-y-3'>
                <FormLabel>
                  Type <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value} className='flex flex-wrap gap-4'>
                    {['post', 'story', 'reel'].map((type) => (
                      <FormItem key={type}>
                        <FormControl>
                          <RadioGroupItem value={type} className='peer sr-only' id={type} />
                        </FormControl>
                        <FormLabel
                          htmlFor={type}
                          className='flex items-center justify-center rounded-md border-2 border-muted bg-transparent px-6 py-2 hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground cursor-pointer'
                        >
                          {type.toUpperCase()}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Description <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <AppInput field={field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Accordion type='single' collapsible className='w-full'>
            <AccordionItem value='media'>
              <AccordionTrigger>Media</AccordionTrigger>
              <AccordionContent>
                <FormField
                  control={form.control}
                  name='images'
                  render={({}) => (
                    <FormItem>
                      <FormControl>
                        <Card className='border-dashed'>
                          <CardContent className='p-6'>
                            <Input
                              type='file'
                              accept='image/*'
                              multiple
                              className='hidden'
                              onChange={onImageUpload}
                              id='image-upload'
                            />
                            <label
                              htmlFor='image-upload'
                              className='cursor-pointer flex flex-col items-center justify-center py-6 bg-muted hover:bg-muted/80 rounded-md transition-colors'
                            >
                              <Upload className='size-8 mb-2' />
                              <p className='text-sm text-muted-foreground'>Upload Images</p>
                            </label>
                          </CardContent>
                        </Card>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Schedule Fields */}
          <div className='grid gap-4 sm:grid-cols-2'>
            <FormField
              control={form.control}
              name='scheduledDate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheduled Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'pl-3 text-left font-normal flex w-full',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? moment(field.value).format('MM/DD/YYYY') : 'Pick a date'}
                          <Calendar className='ml-auto size-4 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <CalendarComponent
                        mode='single'
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        disabled={(date) => moment(date).isBefore(moment(), 'day')}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='scheduledTime'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <div className='flex items-center justify-end space-x-2'>
                      <Label htmlFor='recurring-toggle' className='text-sm'>
                        Recurring
                      </Label>
                      <Switch id='recurring-toggle' checked={isRecurring} onCheckedChange={setIsRecurring} />
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input type='time' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Recurring Schedule */}
          {isRecurring && (
            <div className='border rounded-md p-4 space-y-4'>
              <Label className='text-sm font-medium block'>Recurring Schedule</Label>

              <RadioGroup value={recurringType} onValueChange={setRecurringType} className='space-y-2'>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='daily' id='daily' />
                  <Label htmlFor='daily'>Daily</Label>
                </div>

                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='weekly' id='weekly' />
                  <Label htmlFor='weekly'>Weekly</Label>
                </div>
              </RadioGroup>

              {recurringType === 'weekly' && (
                <div className='pt-2'>
                  <Label className='text-sm font-medium mb-2 block'>Select days of week</Label>
                  <div className='grid grid-cols-2 gap-2'>
                    {weekdays.map((day) => (
                      <div key={day.value} className='flex items-center space-x-2'>
                        <Checkbox
                          id={`day-${day.value}`}
                          checked={recurringDays.includes(day.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setRecurringDays([...recurringDays, day.value])
                            } else {
                              setRecurringDays(recurringDays.filter((d) => d !== day.value))
                            }
                          }}
                        />
                        <Label htmlFor={`day-${day.value}`}>{day.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className='pt-2 border-t mt-4'>
                <Label className='text-sm font-medium mb-2 block'>Date Range (up to one month)</Label>

                <Popover open={dateRangeOpen} onOpenChange={setDateRangeOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dateRange && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className='mr-2 size-4' />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, 'MMM dd, yyyy')} - {format(dateRange.to, 'MMM dd, yyyy')}
                          </>
                        ) : (
                          format(dateRange.from, 'PPP')
                        )
                      ) : (
                        <span>Select date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <CalendarComponent
                      initialFocus
                      mode='range'
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={handleDateRangeSelect}
                      numberOfMonths={2}
                      disabled={(date) => {
                        if (isBefore(date, new Date())) {
                          return true
                        }

                        if (dateRange?.from && isAfter(date, addMonths(dateRange.from, 1))) {
                          return true
                        }

                        return false
                      }}
                    />
                    <div className='p-3 border-t text-xs text-muted-foreground'>
                      You can select a date range up to one month
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
