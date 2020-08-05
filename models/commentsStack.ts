import CommentsStackLayer from './commentsStackLayer';

/**
 * Stack for post screen navigation.
 * Each post screen has a comment layer
 */
export default class CommentsStack {
  private stack: Array<CommentsStackLayer>;
  constructor() {
    this.stack = [];
  }

  /**
   * Method push a new layer when navigating
   * @param commentLayer New
   */
  push = (commentLayer: CommentsStackLayer) => {
    this.stack.push(commentLayer);
  };

  pop = () => {
    if (this.stack.length > 0) {
      return this.stack.pop() as CommentsStackLayer;
    }
    return null;
  };

  top = () => {
    if (this.stack.length > 0) {
      const topLayer = this.stack[this.stack.length - 1];
      const errorClone = topLayer.error
        ? new Error(topLayer.error.message)
        : null;
      const createCommentErrorClone = topLayer.createCommentError
        ? new Error(topLayer.createCommentError.message)
        : null;
      const interactCommentErrorClone = topLayer.interactCommentError
        ? new Error(topLayer.interactCommentError.message)
        : null;
      const deleteCommentErrorClone = topLayer.deleteCommentError
        ? new Error(topLayer.deleteCommentError.message)
        : null;
      return {
        ...topLayer,
        error: errorClone,
        createCommentError: createCommentErrorClone,
        interactCommentError: interactCommentErrorClone,
        deleteCommentError: deleteCommentErrorClone,
        commentList: topLayer.commentList.map((comment) => ({ ...comment })),
      };
    }
    return null;
  };

  updateTop = (postLayer: CommentsStackLayer) => {
    if (this.stack.length > 0) {
      this.stack[this.stack.length - 1] = postLayer;
    }
  };

  isEmpty = () => this.stack.length === 0;

  size = () => this.stack.length;

  private toArray = () => this.stack;

  static clone = (stackForClone: CommentsStack) => {
    const newStack = new CommentsStack();
    const array = stackForClone.toArray();

    for (const postLayer of array) {
      const errorClone = postLayer.error
        ? new Error(postLayer.error.message)
        : null;
      const createCommentErrorClone = postLayer.createCommentError
        ? new Error(postLayer.createCommentError.message)
        : null;
      const interactCommentErrorClone = postLayer.interactCommentError
        ? new Error(postLayer.interactCommentError.message)
        : null;
      const deleteCommentErrorClone = postLayer.deleteCommentError
        ? new Error(postLayer.deleteCommentError.message)
        : null;
      const clonedPostLayer = {
        postID: postLayer.postID,
        loading: postLayer.loading,
        createCommentLoading: postLayer.createCommentLoading,
        lastVisible: postLayer.lastVisible,
        error: errorClone,
        createCommentError: createCommentErrorClone,
        deleteCommentError: deleteCommentErrorClone,
        interactCommentError: interactCommentErrorClone,
        type: postLayer.type,
        commentList: postLayer.commentList.map((comment) => ({ ...comment })),
      };
      newStack.push(clonedPostLayer);
    }

    return newStack;
  };
}
