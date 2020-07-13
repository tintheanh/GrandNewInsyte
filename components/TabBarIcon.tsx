import React from 'react';
import Colors from '../constants/Colors';

interface TabBarIconProps {
  name: string;
  focused: boolean;
  icon: JSX.Element | React.ReactNode;
}

export default function TabBarIcon(props: TabBarIconProps) {
  const FontIcon = props.icon as any;
  return (
    <FontIcon
      name={props.name}
      size={28}
      style={{ marginBottom: -3 }}
      color={props.focused ? Colors.tabIconSelected : Colors.tabIconDefault}
    />
  );
}
