import ReplyStackLayer from './reply_stack_layer';
import CommentStackLayer from './comment_stack_layer';
import UserStackLayer from './user_stack_layer';
import Reply from './reply';
import Comment from './comment';

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
   * Method peek to see the top of current stack
   */
  top = () => {
    if (this.stack.length > 0) {
      return this.stack[this.stack.length - 1];
    }
    return null;
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

  /**
   * Helper method get the real array stack
   */
  private toArray = () => this.stack;

  /**
   * Generic method clone a stack
   * @param stackToClone
   */
  static clone = (stackToClone: NavigationStack<any>) => {
    if (stackToClone.isEmpty()) {
      return stackToClone;
    }
    const layer = stackToClone.top();

    let newStack = null;
    if ('postID' in layer) {
      newStack = new NavigationStack<CommentStackLayer>();
    } else if ('commentID' in layer) {
      newStack = new NavigationStack<ReplyStackLayer>();
    } else if ('userID' in layer) {
      newStack = new NavigationStack<UserStackLayer>();
    } else {
      throw new Error('Invalid arguments.');
    }

    const array = stackToClone.toArray();

    for (const oneLayer of array) {
      let layerClone: any = null;

      if ('postID' in oneLayer) {
        const fetchErrorClone = oneLayer.errors.fetchError
          ? new Error(oneLayer.errors.fetchError.message)
          : null;
        const createCommentErrorClone = oneLayer.errors.createCommentError
          ? new Error(oneLayer.errors.createCommentError.message)
          : null;
        const likeCommentErrorClone = oneLayer.errors.likeCommentError
          ? new Error(oneLayer.errors.likeCommentError.message)
          : null;
        const unlikeCommentErrorClone = oneLayer.errors.unlikeCommentError
          ? new Error(oneLayer.errors.unlikeCommentError.message)
          : null;
        const deleteCommentErrorClone = oneLayer.errors.deleteCommentError
          ? new Error(oneLayer.errors.deleteCommentError.message)
          : null;
        layerClone = {
          postID: oneLayer.postID,
          errors: {
            fetchError: fetchErrorClone,
            createCommentError: createCommentErrorClone,
            likeCommentError: likeCommentErrorClone,
            unlikeCommentError: unlikeCommentErrorClone,
            deleteCommentError: deleteCommentErrorClone,
          },
          loadings: {
            fetchLoading: oneLayer.loadings.fetchLoading,
            createCommentLoading: oneLayer.loadings.createCommentLoading,
          },
          lastVisible: oneLayer.lastVisible,
          comments: oneLayer.comments.map((comment: Comment) => ({
            ...comment,
          })),
        };
      } else if ('commentID' in oneLayer) {
        const fetchErrorClone = oneLayer.errors.fetchError
          ? new Error(oneLayer.errors.fetchError.message)
          : null;
        const createReplyErrorClone = oneLayer.errors.createReplyError
          ? new Error(oneLayer.errors.createReplyError.message)
          : null;
        const likeReplyErrorClone = oneLayer.errors.likeReplyError
          ? new Error(oneLayer.errors.likeReplyError.message)
          : null;
        const unlikeReplyErrorClone = oneLayer.errors.unlikeReplyError
          ? new Error(oneLayer.errors.unlikeReplyError.message)
          : null;
        const deleteReplyErrorClone = oneLayer.errors.deleteReplyError
          ? new Error(oneLayer.errors.deleteReplyError.message)
          : null;
        layerClone = {
          commentID: oneLayer.commentID,
          lastVisible: oneLayer.lastVisible,
          errors: {
            fetchError: fetchErrorClone,
            createReplyError: createReplyErrorClone,
            likeReplyError: likeReplyErrorClone,
            unlikeReplyError: unlikeReplyErrorClone,
            deleteReplyError: deleteReplyErrorClone,
          },
          loadings: {
            fetchLoading: oneLayer.loadings.fetchLoading,
            createReplyLoading: oneLayer.loadings.createReplyLoading,
          },
          replies: oneLayer.replies.map((reply: Reply) => ({ ...reply })),
        };
      } else {
        const fetchErrorClone = oneLayer.errors.fetchError
          ? new Error(oneLayer.errors.fetchError.message)
          : null;
        const followErrorClone = oneLayer.errors.followError
          ? new Error(oneLayer.errors.followError.message)
          : null;
        const unfollowErrorClone = oneLayer.errors.unfollow
          ? new Error(oneLayer.errors.unfollow.message)
          : null;
        layerClone = {
          userID: oneLayer.userID,
          username: oneLayer.username,
          name: oneLayer.name,
          avatar: oneLayer.avatar,
          bio: oneLayer.bio,
          following: oneLayer.following,
          followers: oneLayer.followers,
          totalPosts: oneLayer.totalPosts,
          isFollowed: oneLayer.isFollowed,
          errors: {
            fetchError: fetchErrorClone,
            followError: followErrorClone,
            unfollowError: unfollowErrorClone,
          },
          loading: oneLayer.loading,
          lastVisible: oneLayer.lastVisible,
          currentViewableIndex: oneLayer.currentViewableIndex,
          posts: oneLayer.posts,
        };
      }

      newStack.push(layerClone);
    }

    return newStack;
  };
}
