import UsersStackLayer from './usersStackLayer';

/**
 * Stack for user screen navigation.
 * Each user screen has a user layer
 */
export default class UsersStack {
  private stack: Array<UsersStackLayer>;
  constructor() {
    this.stack = [];
  }

  /**
   * Method push a new layer when navigating
   * @param postLayer New layer to push
   */
  push = (postLayer: UsersStackLayer) => {
    this.stack.push(postLayer);
  };

  pop = () => {
    if (this.stack.length > 0) {
      return this.stack.pop() as UsersStackLayer;
    }
    return null;
  };

  top = () => {
    if (this.stack.length > 0) {
      const topLayer = this.stack[this.stack.length - 1];
      const errorClone = topLayer.error
        ? new Error(topLayer.error.message)
        : null;
      return {
        ...topLayer,
        error: errorClone,
        posts: topLayer.posts.map((post) => ({ ...post })),
      };
    }
    return null;
  };

  updateTop = (postLayer: UsersStackLayer) => {
    if (this.stack.length > 0) {
      this.stack[this.stack.length - 1] = postLayer;
    }
  };

  isEmpty = () => this.stack.length === 0;

  size = () => this.stack.length;

  private toArray = () => this.stack;

  static clone = (stackForClone: UsersStack) => {
    const newStack = new UsersStack();
    const array = stackForClone.toArray();

    for (const userLayer of array) {
      const errorClone = userLayer.error
        ? new Error(userLayer.error.message)
        : null;
      const clonedUserLayer = {
        ...userLayer,
        error: errorClone,
        posts: userLayer.posts.map((post) => ({ ...post })),
      };
      newStack.push(clonedUserLayer);
    }

    return newStack;
  };
}
