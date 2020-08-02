import React from 'react';
import TextBox from './TextBox';
import { SimpleLineIcons } from '../constants';

interface EmailTextBoxProps {
  value: string;

  /**
   * Required method set input email
   * @param value New email value to set
   */
  setEmail: (value: string) => void;
}

export default React.memo(
  function EmailTextBox({ value, setEmail }: EmailTextBoxProps) {
    return (
      <TextBox
        icon={<SimpleLineIcons name="envelope" size={24} color="#a6a9b4" />}
        placeholder="email"
        type="email-address"
        value={value}
        onChangeText={setEmail}
      />
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.value !== nextProps.value) {
      return false;
    }
    return true;
  },
);
