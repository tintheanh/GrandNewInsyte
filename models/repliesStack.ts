import RepliesStackLayer from './repliesStackLayer';

/**
 * Stack for reply screen navigation.
 * Each reply screen has a reply layer
 */
export default class RepliesStack {
  private stack: Array<RepliesStackLayer>;
  constructor() {
    this.stack = [];
  }

  /**
   * Method push a new layer when navigating
   * @param replyLayer New layer to push
   */

  push = (replyLayer: RepliesStackLayer) => {
    this.stack.push(replyLayer);
  };

  /**
   * Method pop the top layer when screen going back
   */
  pop = () => {
    if (this.stack.length > 0) {
      return this.stack.pop() as RepliesStackLayer;
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
   * @param newReplyLayer New layer to update
   */
  updateTop = (newReplyLayer: RepliesStackLayer) => {
    if (this.stack.length > 0) {
      this.stack[this.stack.length - 1] = newReplyLayer;
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
   */ private toArray = () => this.stack;

  static clone = (stackForClone: RepliesStack) => {
    const newStack = new RepliesStack();
    const array = stackForClone.toArray();

    for (const replyLayer of array) {
      const fetchErrorClone = replyLayer.errors.fetchError
        ? new Error(replyLayer.errors.fetchError.message)
        : null;
      const createReplyErrorClone = replyLayer.errors.createReplyError
        ? new Error(replyLayer.errors.createReplyError.message)
        : null;
      const likeReplyErrorClone = replyLayer.errors.likeReplyError
        ? new Error(replyLayer.errors.likeReplyError.message)
        : null;
      const unlikeReplyErrorClone = replyLayer.errors.unlikeReplyError
        ? new Error(replyLayer.errors.unlikeReplyError.message)
        : null;
      const deleteReplyErrorClone = replyLayer.errors.deleteReplyError
        ? new Error(replyLayer.errors.deleteReplyError.message)
        : null;
      const clonedReplyLayer = {
        // postID: replyLayer.postID,
        commentID: replyLayer.commentID,
        lastVisible: replyLayer.lastVisible,
        errors: {
          fetchError: fetchErrorClone,
          createReplyError: createReplyErrorClone,
          likeReplyError: likeReplyErrorClone,
          unlikeReplyError: unlikeReplyErrorClone,
          deleteReplyError: deleteReplyErrorClone,
        },
        loadings: {
          fetchLoading: replyLayer.loadings.fetchLoading,
          createReplyLoading: replyLayer.loadings.createReplyLoading,
        },
        replyList: replyLayer.replyList.map((reply) => ({ ...reply })),
      };
      newStack.push(clonedReplyLayer);
    }

    return newStack;
  };
}
