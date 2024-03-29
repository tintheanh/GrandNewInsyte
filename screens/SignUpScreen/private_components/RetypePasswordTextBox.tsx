import React from 'react';
import { SimpleLineIcons } from '../../../constants';
import { TextBox } from '../../../components';

interface PasswordTextBoxProps {
  value: string;

  /**
   * Required method set retype-password value
   * @param value New retype-password value to set
   */
  setRetypePassword: (value: string) => void;
}

export default React.memo(
  function RetypePasswordTextBox({
    value,
    setRetypePassword,
  }: PasswordTextBoxProps) {
    return (
      <TextBox
        icon={<SimpleLineIcons name="lock" size={26} color="#a6a9b4" />}
        secureTextEntry={true}
        placeholder="retype password"
        value={value}
        onChangeText={setRetypePassword}
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
