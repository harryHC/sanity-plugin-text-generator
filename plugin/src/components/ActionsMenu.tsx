import {ChevronDownIcon} from '@sanity/icons'
import {Button, Menu, MenuButton, MenuItem} from '@sanity/ui'
import React from 'react'

import {BUTTONS_PADDING} from './TextInputWithButton'

export type GenerationOption = 'Generate' | 'Summarise' | 'Translate'
const GENERATION_OPTIONS: GenerationOption[] = ['Generate', 'Summarise', 'Translate']

interface ActionsMenuProps {
  MenuToggleButtonProps?: Record<string, unknown>
  onOptionChange: (option: GenerationOption) => void
  selectedOption: GenerationOption
}

const ActionsMenu = ({
  MenuToggleButtonProps = {},
  onOptionChange,
  selectedOption,
}: ActionsMenuProps): React.ReactElement => {
  return (
    <MenuButton
      button={
        <Button
          {...MenuToggleButtonProps}
          mode="default"
          tone="primary"
          icon={ChevronDownIcon}
          padding={BUTTONS_PADDING}
        />
      }
      id="text-generation-options"
      aria-label="Text generation options"
      menu={
        <Menu>
          {GENERATION_OPTIONS.map((genOption) => (
            <MenuItem
              padding={BUTTONS_PADDING}
              key={genOption}
              text={genOption}
              // eslint-disable-next-line react/jsx-no-bind
              onClick={() => onOptionChange(genOption)}
              tone={selectedOption === genOption ? 'primary' : 'default'}
            />
          ))}
        </Menu>
      }
      popover={{portal: true, placement: 'bottom-end'}}
    />
  )
}

export default ActionsMenu
