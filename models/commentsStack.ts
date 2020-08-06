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
   * @param commentLayer New layer to push
   */
  push = (commentLayer: CommentsStackLayer) => {
    this.stack.push(commentLayer);
  };

  /**
   * Method pop the top layer when screen going back
   */
  pop = () => {
    if (this.stack.length > 0) {
      return this.stack.pop() as CommentsStackLayer;
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
   * Method clone the top layer
   */
  // cloneTop = () => {
  //   if (this.stack.length > 0) {
  //     const topLayer = this.stack[this.stack.length - 1];
  //     const fetchErrorClone = topLayer.errors.fetchError
  //       ? new Error(topLayer.errors.fetchError.message)
  //       : null;
  //     const createCommentErrorClone = topLayer.errors.createCommentError
  //       ? new Error(topLayer.errors.createCommentError.message)
  //       : null;
  //     const likeCommentErrorClone = topLayer.errors.likeCommentError
  //       ? new Error(topLayer.errors.likeCommentError.message)
  //       : null;
  //     const unlikeCommentErrorClone = topLayer.errors.unlikeCommentError
  //       ? new Error(topLayer.errors.unlikeCommentError.message)
  //       : null;
  //     const deleteCommentErrorClone = topLayer.errors.deleteCommentError
  //       ? new Error(topLayer.errors.deleteCommentError.message)
  //       : null;
  //     return {
  //       ...topLayer,
  //       errors: {
  //         fetchError: fetchErrorClone,
  //         createCommentError: createCommentErrorClone,
  //         deleteCommentError: deleteCommentErrorClone,
  //         likeCommentError: likeCommentErrorClone,
  //         unlikeCommentError: unlikeCommentErrorClone,
  //       },
  //       commentList: topLayer.commentList.map((comment) => ({ ...comment })),
  //     };
  //   }
  //   return null;
  // };

  /**
   * Method update top layer
   * @param newCommentLayer New layer to update
   */
  updateTop = (newCommentLayer: CommentsStackLayer) => {
    if (this.stack.length > 0) {
      this.stack[this.stack.length - 1] = newCommentLayer;
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
   * Static method to clone a stack
   * @param stackForClone
   */
  static clone = (stackForClone: CommentsStack) => {
    const newStack = new CommentsStack();
    const array = stackForClone.toArray();

    for (const commentLayer of array) {
      const fetchErrorClone = commentLayer.errors.fetchError
        ? new Error(commentLayer.errors.fetchError.message)
        : null;
      const createCommentErrorClone = commentLayer.errors.createCommentError
        ? new Error(commentLayer.errors.createCommentError.message)
        : null;
      const likeCommentErrorClone = commentLayer.errors.likeCommentError
        ? new Error(commentLayer.errors.likeCommentError.message)
        : null;
      const unlikeCommentErrorClone = commentLayer.errors.unlikeCommentError
        ? new Error(commentLayer.errors.unlikeCommentError.message)
        : null;
      const deleteCommentErrorClone = commentLayer.errors.deleteCommentError
        ? new Error(commentLayer.errors.deleteCommentError.message)
        : null;
      const clonedPostLayer = {
        postID: commentLayer.postID,
        errors: {
          fetchError: fetchErrorClone,
          createCommentError: createCommentErrorClone,
          likeCommentError: likeCommentErrorClone,
          unlikeCommentError: unlikeCommentErrorClone,
          deleteCommentError: deleteCommentErrorClone,
        },
        loadings: {
          fetchLoading: commentLayer.loadings.fetchLoading,
          createCommentLoading: commentLayer.loadings.createCommentLoading,
        },
        lastVisible: commentLayer.lastVisible,
        commentList: commentLayer.commentList.map((comment) => ({
          ...comment,
        })),
      };
      newStack.push(clonedPostLayer);
    }

    return newStack;
  };
}
