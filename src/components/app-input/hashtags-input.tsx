import React, { KeyboardEvent, useState } from 'react'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface HashtagInputProps {
  value: string[]
  onChange: (value: string[]) => void
}

const HashtagInput = ({ value, onChange }: HashtagInputProps) => {
  const [inputValue, setInputValue] = useState('')

  // Function to clean and validate tag text
  const cleanTagText = (text: string) => {
    // Remove leading/trailing spaces and #
    let cleaned = text.trim().replace(/^#/, '')

    // Allow Vietnamese characters and basic alphanumeric
    // Remove any other special characters
    cleaned = cleaned.replace(/[^a-zA-Z0-9\u00C0-\u1EF9\s]/g, '')

    return cleaned
  }

  const isValidTag = (tag: string) => {
    return tag.length > 0 && !value.includes(tag)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Skip handling for composition events (IME input)
    if (e.nativeEvent.isComposing) {
      return
    }

    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
      e.preventDefault()

      const tag = cleanTagText(inputValue)

      if (isValidTag(tag)) {
        onChange([...value, tag])
        setInputValue('')
      }
    }

    // Remove last tag on backspace if input is empty
    if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      e.preventDefault()
      const newTags = [...value]
      newTags.pop()
      onChange(newTags)
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow Vietnamese text input
    setInputValue(e.target.value)
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove))
  }

  // Handle paste event
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    const pastedTags = pastedText
      .split(/[\s,]+/) // Split by space or comma
      .map(cleanTagText)
      .filter(isValidTag)

    if (pastedTags.length > 0) {
      onChange([...value, ...pastedTags])
    }
  }

  const t = useTranslations('createPostModal')

  return (
    <div className='w-full max-w-xl space-y-2'>
      <div className='flex flex-wrap gap-2 p-2 min-h-10 rounded-md border'>
        {value.map((tag) => (
          <Badge key={tag} variant='secondary' className='flex items-center gap-1 px-2 py-1'>
            #{tag}
            <X size={14} className='cursor-pointer hover:text-destructive' onClick={() => removeTag(tag)} />
          </Badge>
        ))}
        <Input
          type='text'
          value={inputValue}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          className='grow border-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0'
          placeholder={t('hashtagsPlaceholder')}
        />
      </div>
      <p className='text-sm text-muted-foreground'>{t('hashtagsNote')}</p>
    </div>
  )
}

export default HashtagInput
