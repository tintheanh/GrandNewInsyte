import React from 'react';
import { SimpleLineIcons } from '../constants';
import TextBox from './TextBox';

interface PasswordTextBoxProps {
  value: string;

  /**
   * Required method set password value
   * @param value New password value to set
   */
  setPassword: (value: string) => void;
}

export default React.memo(
  function PasswordTextBox({ value, setPassword }: PasswordTextBoxProps) {
    return (
      <TextBox
        icon={<SimpleLineIcons name="lock" size={26} color="#a6a9b4" />}
        secureTextEntry={true}
        placeholder="password"
        value={value}
        onChangeText={setPassword}
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
