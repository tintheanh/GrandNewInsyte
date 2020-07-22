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
      return this.stack[this.stack.length - 1];
    }
    return null;
  };

  updateTop = (postLayer: PostStackLayer) => {
    if (this.stack.length > 0) {
      this.stack[this.stack.length - 1] = postLayer;
    }
  };

  isEmpty = () => this.stack.length === 0;

  private toArray = () => this.stack;

  static clone = (stackForClone: PostStack) => {
    const newStack = new PostStack();
    const array = stackForClone.toArray();

    for (const postLayer of array) {
      const newError = postLayer.error
        ? new Error(postLayer.error.message)
        : null;
      const clonePost = {
        postID: postLayer.postID,
        loading: postLayer.loading,
        lastVisible: postLayer.lastVisible,
        error: newError,
        commentList: postLayer.commentList.map((comment) => ({ ...comment })),
      };
      newStack.push(clonePost);
    }

    return newStack;
  };
}
