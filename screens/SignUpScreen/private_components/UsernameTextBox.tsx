import React from 'react';
import { TextBox } from '../../../components';
import { SimpleLineIcons } from '../../../constants';

interface UsernameTextBoxProps {
  value: string;

  /**
   * Required method set input username
   * @param value New username value to set
   */
  setUsername: (value: string) => void;
}

export default React.memo(
  function UsernameTextBox({ value, setUsername }: UsernameTextBoxProps) {
    return (
      <TextBox
        icon={<SimpleLineIcons name="user" size={24} color="#a6a9b4" />}
        placeholder="username"
        value={value}
        onChangeText={setUsername}
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
