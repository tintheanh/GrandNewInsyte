import React, { useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Modal } from 'react-native';
import ModalEditUserProfile from './ModalEditUserProfile';
import Colors from '../../../constants/Colors';

interface UserProfileEditBtnProps {
  avatar: string;
  name: string;
  bio: string;
}

export default function UserProfileEditBtn({
  avatar,
  name,
  bio,
}: UserProfileEditBtnProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = () => setModalVisible(true);

  const closeModal = () => setModalVisible(false);

  // const closeModal = () => {
  //   Alert.alert(
  //     '',
  //     'All unsaved changes will be discarded',
  //     [
  //       {
  //         text: 'Discard',
  //         onPress: () => setModalVisible(false),
  //       },

  //       {
  //         text: 'Cancel',
  //         style: 'cancel',
  //       },
  //     ],
  //     { cancelable: true }
  //   );
  // };

  return (
    <View>
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <ModalEditUserProfile
          avatar={avatar}
          name={name}
          bio={bio}
          closeModal={closeModal}
        />
      </Modal>
      <TouchableOpacity onPress={openModal}>
        <View style={styles.btn}>
          <Text style={styles.label}>Edit Profile</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: Colors.btnColor,
    paddingTop: 5,
    paddingBottom: 5,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  label: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '500',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    // margin: 20,
    // backgroundColor: 'white',
    // borderRadius: 20,
    // padding: 35,
    // alignItems: 'center',
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    // elevation: 5,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.darkColor,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  openButton: {
    backgroundColor: '#F194FF',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});
