import ReplyStackLayer from './reply_stack_layer';
import CommentStackLayer from './comment_stack_layer';
import UserStackLayer from './user_stack_layer';
import PlaceStackLayer from './place_stack_layer';
import Reply from './reply';
import Comment from './comment';
import Post from './post';
import Media from './media';

export default class NavigationStack<T> {
  private stack: Array<T>;

  constructor() {
    this.stack = [];
  }

  /**
   * Method push a new layer when navigating
   * @param newLayer New layer to push
   */
  push = (newLayer: T) => {
    this.stack.push(newLayer);
  };

  /**
   * Method pop the top layer when screen going back
   */
  pop = () => {
    if (this.stack.length > 0) {
      return this.stack.pop() as T;
    }
    return null;
  };

  /**
   * Method get the real top of current stack
   */
  top = () => {
    if (this.isEmpty()) {
      return null;
    }
    return this.stack[this.stack.length - 1];
  };

  /**
   * Method get the top clone of current stack
   */
  getTopClone = ():
    | CommentStackLayer
    | ReplyStackLayer
    | UserStackLayer
    | PlaceStackLayer
    | null => {
    if (this.isEmpty()) {
      return null;
    }

    const top = this.stack[this.stack.length - 1] as any;
    let topClone:
      | CommentStackLayer
      | ReplyStackLayer
      | UserStackLayer
      | PlaceStackLayer;
    if ('postID' in top) {
      const fetchErrorClone = top.errors.fetchError
        ? new Error(top.errors.fetchError.message)
        : null;
      const createCommentErrorClone = top.errors.createCommentError
        ? new Error(top.errors.createCommentError.message)
        : null;
      const likeCommentErrorClone = top.errors.likeCommentError
        ? new Error(top.errors.likeCommentError.message)
        : null;
      const unlikeCommentErrorClone = top.errors.unlikeCommentError
        ? new Error(top.errors.unlikeCommentError.message)
        : null;
      const deleteCommentErrorClone = top.errors.deleteCommentError
        ? new Error(top.errors.deleteCommentError.message)
        : null;
      topClone = {
        postID: top.postID,
        errors: {
          fetchError: fetchErrorClone,
          createCommentError: createCommentErrorClone,
          likeCommentError: likeCommentErrorClone,
          unlikeCommentError: unlikeCommentErrorClone,
          deleteCommentError: deleteCommentErrorClone,
        },
        loadings: {
          fetchLoading: top.loadings.fetchLoading,
          createCommentLoading: top.loadings.createCommentLoading,
        },
        lastVisible: top.lastVisible,
        comments: top.comments.map((comment: Comment) => ({
          ...comment,
        })),
      };
    } else if ('commentID' in top) {
      const fetchErrorClone = top.errors.fetchError
        ? new Error(top.errors.fetchError.message)
        : null;
      const createReplyErrorClone = top.errors.createReplyError
        ? new Error(top.errors.createReplyError.message)
        : null;
      const likeReplyErrorClone = top.errors.likeReplyError
        ? new Error(top.errors.likeReplyError.message)
        : null;
      const unlikeReplyErrorClone = top.errors.unlikeReplyError
        ? new Error(top.errors.unlikeReplyError.message)
        : null;
      const deleteReplyErrorClone = top.errors.deleteReplyError
        ? new Error(top.errors.deleteReplyError.message)
        : null;
      topClone = {
        commentID: top.commentID,
        lastVisible: top.lastVisible,
        errors: {
          fetchError: fetchErrorClone,
          createReplyError: createReplyErrorClone,
          likeReplyError: likeReplyErrorClone,
          unlikeReplyError: unlikeReplyErrorClone,
          deleteReplyError: deleteReplyErrorClone,
        },
        loadings: {
          fetchLoading: top.loadings.fetchLoading,
          createReplyLoading: top.loadings.createReplyLoading,
        },
        replies: top.replies.map((reply: Reply) => ({ ...reply })),
      };
    } else if ('userID' in top) {
      const fetchErrorClone = top.errors.fetchError
        ? new Error(top.errors.fetchError.message)
        : null;
      const followErrorClone = top.errors.followError
        ? new Error(top.errors.followError.message)
        : null;
      const unfollowErrorClone = top.errors.unfollow
        ? new Error(top.errors.unfollow.message)
        : null;
      topClone = {
        userID: top.userID,
        username: top.username,
        name: top.name,
        avatar: top.avatar,
        bio: top.bio,
        following: top.following,
        followers: top.followers,
        totalPosts: top.totalPosts,
        isFollowed: top.isFollowed,
        errors: {
          fetchError: fetchErrorClone,
          followError: followErrorClone,
          unfollowError: unfollowErrorClone,
        },
        loading: top.loading,
        lastVisible: top.lastVisible,
        currentViewableIndex: top.currentViewableIndex,
        posts: top.posts.map((post: Post) => ({ ...post })),
      };
    } else if ('placeID' in top) {
      const fetchErrorClone = top.errors.fetchError
        ? new Error(top.errors.fetchError.message)
        : null;
      const followErrorClone = top.errors.followError
        ? new Error(top.errors.followError.message)
        : null;
      const unfollowErrorClone = top.errors.unfollow
        ? new Error(top.errors.unfollow.message)
        : null;
      topClone = {
        placeID: top.placeID,
        placeData: { ...top.placeData },
        errors: {
          fetchError: fetchErrorClone,
          followError: followErrorClone,
          unfollowError: unfollowErrorClone,
        },
        loading: top.loading,
        lastOwnPostVisible: top.lastOwnPostVisible,
        lastCheckinPostVisible: top.lastCheckinPostVisible,
        currentViewableOwnPostIndex: top.currentViewableOwnPostIndex,
        currentViewableCheckinPostIndex: top.currentViewableCheckinPostIndex,
      } as PlaceStackLayer;
    } else {
      throw new Error('Invalid arguments.');
    }
    return topClone;
  };

  /**
   * Method update top layer
   * @param newLayer New layer to update
   */
  updateTop = (newLayer: T) => {
    if (this.stack.length > 0) {
      this.stack[this.stack.length - 1] = newLayer;
    }
  };

  /**
   * Method check if current stack has no element
   */
  isEmpty = () => this.stack.length === 0;

  /**
   * Method get current size of the stack
   */
  size = () => this.stack.length;
}
