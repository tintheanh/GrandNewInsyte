import RepliesStackLayer from './repliesStackLayer';

export default class RepliesStack {
  private stack: Array<RepliesStackLayer>;
  constructor() {
    this.stack = [];
  }

  push = (replyLayer: RepliesStackLayer) => {
    this.stack.push(replyLayer);
  };

  pop = () => {
    if (this.stack.length > 0) {
      return this.stack.pop() as RepliesStackLayer;
    }
    return null;
  };

  top = () => {
    if (this.stack.length > 0) {
      const topLayer = this.stack[this.stack.length - 1];
      const errorClone = topLayer.error
        ? new Error(topLayer.error.message)
        : null;
      const createReplyErrorClone = topLayer.createReplyError
        ? new Error(topLayer.createReplyError.message)
        : null;
      const interactReplyErrorClone = topLayer.interactReplyError
        ? new Error(topLayer.interactReplyError.message)
        : null;
      const deleteReplyErrorClone = topLayer.deleteReplyError
        ? new Error(topLayer.deleteReplyError.message)
        : null;
      return {
        ...topLayer,
        error: errorClone,
        createReplyError: createReplyErrorClone,
        interactReplyError: interactReplyErrorClone,
        deleteReplyError: deleteReplyErrorClone,
        replyList: topLayer.replyList.map((comment) => ({ ...comment })),
      };
    }
    return null;
  };

  updateTop = (replyLayer: RepliesStackLayer) => {
    if (this.stack.length > 0) {
      this.stack[this.stack.length - 1] = replyLayer;
    }
  };

  isEmpty = () => this.stack.length === 0;

  size = () => this.stack.length;

  private toArray = () => this.stack;

  static clone = (stackForClone: RepliesStack) => {
    const newStack = new RepliesStack();
    const array = stackForClone.toArray();

    for (const replyLayer of array) {
      const errorClone = replyLayer.error
        ? new Error(replyLayer.error.message)
        : null;
      const createReplyErrorClone = replyLayer.createReplyError
        ? new Error(replyLayer.createReplyError.message)
        : null;
      const interactReplyErrorClone = replyLayer.interactReplyError
        ? new Error(replyLayer.interactReplyError.message)
        : null;
      const deleteReplyErrorClone = replyLayer.deleteReplyError
        ? new Error(replyLayer.deleteReplyError.message)
        : null;
      const clonedPostLayer = {
        postID: replyLayer.postID,
        commentID: replyLayer.commentID,
        loading: replyLayer.loading,
        createReplyLoading: replyLayer.createReplyLoading,
        lastVisible: replyLayer.lastVisible,
        error: errorClone,
        createReplyError: createReplyErrorClone,
        deleteReplyError: deleteReplyErrorClone,
        interactReplyError: interactReplyErrorClone,
        replyList: replyLayer.replyList.map((reply) => ({ ...reply })),
      };
      newStack.push(clonedPostLayer);
    }

    return newStack;
  };
}
