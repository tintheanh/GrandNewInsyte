import PostStackLayer from './postStackLayer';

export default class PostStack {
  private stack: Array<PostStackLayer> = [];
  constructor() {
    this.stack = [];
  }

  push = (postLayer: PostStackLayer) => {
    this.stack.push(postLayer);
  };

  pop = () => {
    if (this.stack.length > 0) {
      return this.stack.pop() as PostStackLayer;
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
      return {
        ...topLayer,
        error: errorClone,
        createCommentError: createCommentErrorClone,
        interactCommentError: interactCommentErrorClone,
        commentList: topLayer.commentList.map((comment) => ({ ...comment })),
      };
    }
    return null;
  };

  updateTop = (postLayer: PostStackLayer) => {
    if (this.stack.length > 0) {
      this.stack[this.stack.length - 1] = postLayer;
    }
  };

  isEmpty = () => this.stack.length === 0;

  size = () => this.stack.length;

  private toArray = () => this.stack;

  static clone = (stackForClone: PostStack) => {
    const newStack = new PostStack();
    const array = stackForClone.toArray();

    for (const postLayer of array) {
      const newError = postLayer.error
        ? new Error(postLayer.error.message)
        : null;
      const newCreateCommentError = postLayer.createCommentError
        ? new Error(postLayer.createCommentError.message)
        : null;
      const newInteractCommentError = postLayer.interactCommentError
        ? new Error(postLayer.interactCommentError.message)
        : null;
      const clonedPostLayer = {
        postID: postLayer.postID,
        loading: postLayer.loading,
        createCommentLoading: postLayer.createCommentLoading,
        lastVisible: postLayer.lastVisible,
        error: newError,
        createCommentError: newCreateCommentError,
        interactCommentError: newInteractCommentError,
        type: postLayer.type,
        commentList: postLayer.commentList.map((comment) => ({ ...comment })),
      };
      newStack.push(clonedPostLayer);
    }

    return newStack;
  };
}
