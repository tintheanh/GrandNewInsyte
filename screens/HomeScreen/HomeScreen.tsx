import React, { Component } from 'react';
import { connect } from 'react-redux';
import faker from 'faker';
import { Loading } from '../../components';
import { AppState } from '../../redux/store';
import HomeAuth from './private_components/HomeAuth';
import HomeNotAuth from './private_components/HomeNotAuth';
import { clearCommentsStack } from '../../redux/commentsStack/actions';
import { clearRepliesStack } from '../../redux/repliesStack/actions';
import { clearUsersStack } from '../../redux/usersStack/actions';
import { fsDB } from '../../config';
import { generateSubstringForUsername } from '../../utils/functions';

// interface FeedProps {
//   onFetchPublicNewPosts: () => void;
//   loading: boolean;
//   posts: Array<any>;
//   error: Error | null;
// }

class HomeScreen extends Component<any> {
  private screenFocus: any;
  constructor(props: any) {
    super(props);
    // for (let i = 0; i < 10; i++) {
    //   DATA.push({
    //     id: '3ac68afc' + i,
    //     user: {
    //       username: faker.internet.userName(),
    //       avatar: faker.image.avatar(),
    //     },
    //     datePosted: parseInt((faker.date.past().getTime() / 1000).toFixed(0)),
    //     caption: faker.lorem.sentence(),
    //     privacy: 'friends',
    //     likes: parseInt(faker.random.number().toFixed(0)),
    //     comments: parseInt(faker.random.number().toFixed(0)),
    //     media: [
    //       {
    //         id: '1',
    //         uri: faker.image.image(),
    //         type: 'image',
    //       },
    //     ],
    //   });
    // }
  }

  componentWillUnmount() {
    this.screenFocus();
  }

  async componentDidMount() {
    this.screenFocus = this.props.navigation.addListener('focus', (e) => {
      // this.props.onClearCommentsStack();
      // this.props.onClearRepliesStack();
      // this.props.onClearUsersStack();
    });

    // try {
    //   const snapshot = await fireStorage
    //     .ref('users/BQ9bdkbxiicCYG8ZNnL5wW6EZ823/img.jpg')
    //     .putString(
    //       'file:///Users/anhnguyen/Library/Developer/CoreSimulator/Devices/2141D00C-5992-4BC1-B364-365A889E18BF/data/Containers/Data/Application/B3F3037D-0E74-417B-B981-84EE950FF54C/Library/Caches/ExponentExperienceData/%2540team.insyte%252FGrandNewInsyte/ImagePicker/D5655AB9-A5A5-4163-A54D-264FE451FF06.jpg'
    //     );
    //   console.log(snapshot.downloadURL);
    // } catch (err) {
    //   console.log(err);
    // }

    for (let i = 0; i < 10; i++) {
      // const reply = {
      //   content: faker.lorem.sentence(),
      //   date_posted: faker.date.between('2020-08-05', '2020-08-07').getTime(),
      //   likes: faker.random.number(100),
      //   posted_by: '9DHOf4becGfrx7fmUXPcYdqtc2I3',
      // };
      // await fsDB
      //   .collection('posts')
      //   .doc('KW4wZGYeK7ZN4zhTvD12')
      //   .collection('comment_list')
      //   .doc('anQqFlRiQuWQTappJNQ7')
      //   .collection('reply_list')
      //   .add(reply);
      // const comment = {
      //   content: faker.lorem.sentence(),
      //   date_posted: faker.date.between('2020-07-11', '2020-07-21').getTime(),
      //   likes: faker.random.number(100),
      //   replies: 0,
      //   posted_by: '9DHOf4becGfrx7fmUXPcYdqtc2I3',
      // };
      // await fsDB
      //   .collection('posts')
      //   .doc('OVzTdk3S0hUFEseleGbS')
      //   .collection('comment_list')
      //   .add(comment);
      // const user = {
      //   avatar: '',
      //   bio: 'test',
      //   followers: 0,
      //   following: 1,
      //   name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      //   username: faker.internet.userName(),
      //   total_posts: 0,
      // };
      // await fsDB
      //   .collection('users')
      //   .doc('fake' + i)
      //   .set(user);
      // await fsDB
      //   .collection('users')
      //   .doc('9DHOf4becGfrx7fmUXPcYdqtc2I3')
      //   .collection('follower_for_search')
      //   .doc('fake' + i)
      //   .set({
      //     prefix: generateSubstringForUsername(user.username),
      //   });
      // const post = {
      //   posted_by: '9DHOf4becGfrx7fmUXPcYdqtc2I3',
      //   caption: faker.lorem.sentence(),
      //   date_posted: faker.date.between('2019-01-08', '2020-07-10').getTime(),
      //   likes: faker.random.number(),
      //   comments: 0,
      //   media: [
      //     {
      //       id: '169',
      //       url: faker.image.image(),
      //       type: 'image',
      //       width: 640,
      //       height: 480,
      //     },
      //   ],
      //   privacy: 'public',
      //   tagged_users: [],
      // };
      // const docRef = await fsDB.collection('posts').add(post);
      // await fbDB.ref('users/BQ9bdkbxiicCYG8ZNnL5wW6EZ823/following_posts/' + docRef.id).set({
      //   date_posted: post.date_posted,
      // });
      // await fsDB
      //   .collection('users')
      //   .doc('BQ9bdkbxiicCYG8ZNnL5wW6EZ823')
      //   .collection('following_posts')
      //   .doc(docRef.id)
      //   .set({
      //     date_posted: post.date_posted,
      //     likes: post.num_likes,
      //   });
    }

    // const docs = await fsDB
    //   .collection('posts')
    //   .where('posted_by', '==', 'DK2K7xfDGTYCXAbh8xLJDxRvs3A2')
    //   .get();
    // docs.forEach(async (doc) => {
    //   await fsDB
    //     .collection('users')
    //     .doc('BQ9bdkbxiicCYG8ZNnL5wW6EZ823')
    //     .collection('following_posts')
    //     .doc(doc.id)
    //     .set({
    //       date_posted: doc.data().date_posted,
    //     });
    // });
  }

  // componentDidMount() {
  //   this.props.onFetchPublicNewPosts();
  // }

  shouldComponentUpdate(nextProps: any) {
    if (this.props.user !== nextProps.user) {
      return true;
    }
    // if (this.props.loading !== nextProps.loading) return true;
    return false;
  }

  render() {
    // console.log(this.props.user);
    // return this.props.user ? <HomeAuth /> : <HomeNotAuth />;
    // console.log(this.props.user);
    // if (!this.props.user) {
    //   return <Loading />;
    // }
    return this.props.user ? <HomeAuth /> : <HomeNotAuth />;

    // return (
    //   <View style={styles.container}>
    //     <HomePublicPostList data={DATA} />
    //   </View>
    // );
  }
}

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: Colors.brightColor,
//     flex: 1,
//   },
// });

const mapStateToProps = (state: AppState) => ({
  // loading: state.allPosts.public.loading,
  // posts: state.allPosts.public.posts,
  // error: state.allPosts.public.error,
  user: state.auth.user,
  // loading: state.auth.loading,
});

const mapDispatchToProps = {
  onClearCommentsStack: clearCommentsStack,
  onClearRepliesStack: clearRepliesStack,
  onClearUsersStack: clearUsersStack,
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
