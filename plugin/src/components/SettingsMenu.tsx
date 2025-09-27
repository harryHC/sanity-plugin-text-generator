import {CogIcon} from '@sanity/icons'
import {Button, Menu, MenuButton, MenuItem} from '@sanity/ui'
import React from 'react'

import {Model, MODELS} from '../constants'
import {BUTTONS_PADDING} from './TextInputWithButton'

interface SettingsMenuProps {
  MenuToggleButtonProps?: Record<string, unknown>
  onOptionChange: (option: Model) => void
  selectedOption: Model
}

const SettingsMenu = ({
  MenuToggleButtonProps = {},
  onOptionChange,
  selectedOption,
}: SettingsMenuProps): React.ReactElement => {
  return (
    <MenuButton
      button={
        <Button
          {...MenuToggleButtonProps}
          mode="default"
          tone="primary"
          icon={CogIcon}
          padding={BUTTONS_PADDING}
        />
      }
      id="text-generation-options"
      aria-label="Text generation options"
      menu={
        <Menu>
          {Object.keys(MODELS).map((key) => (
            <MenuItem
              padding={BUTTONS_PADDING}
              key={key}
              text={MODELS[key as keyof typeof MODELS].name}
              // eslint-disable-next-line react/jsx-no-bind
              onClick={() => onOptionChange(MODELS[key as keyof typeof MODELS])}
              tone={
                selectedOption?.id === MODELS[key as keyof typeof MODELS].id ? 'primary' : 'default'
              }
            />
          ))}
        </Menu>
      }
      popover={{portal: true, placement: 'bottom-end'}}
    />
  )
}

export default SettingsMenu
