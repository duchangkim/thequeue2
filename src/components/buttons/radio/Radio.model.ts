import React, { ChangeEvent } from 'react';
import { QUEUE_UI_SIZES } from 'styles/ui/Size';
import { QUEUE_UI_COLORS } from 'styles/ui/Color';

export interface QueueRadioProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name: string;
  value: any;
  label: any;
  checked?: boolean;
  initialChecked?: boolean;
  disabled?: boolean;
  radioOnChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  radioSize?: QUEUE_UI_SIZES;
  radioColor?: QUEUE_UI_COLORS;
  useIcon?: boolean;
}
