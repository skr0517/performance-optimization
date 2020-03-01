import React, { Component } from "react";
/**
 *  实现步骤
 *  1. 定义一个子组件
 *      1.1 通过数组Array.fill 创建100个假数据
 *  2. 定一些些初始数据
 *      start end height scrollTop 滚动的距离 vData 可视区域数据 topOffset 上padding bottomOffset anchor
 *  3. 计算上下padding让滚动条看起来正常
 *      3.1 上padding  需要顶一个一个anchor 就是一个锚点 第一个元素的位置 top距离上面的距离 bottom下面的距离 index
 *      3.2 下padding  计算下padding 的时候 为什么要用 this.fakeData,length -this.end 是因为 end是动态变化的
 *  4. 滚动时改变 item里数据
 *      4.1 子元素向父元素传递 node和index 子元素通过 ref 获取到node 传递给父元素
 *      4.2 父元素接收到node后 获取到node的距离 getBoundingClientRect() 方法
 *
 *
 */

export default class VirtualList2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      vData: [],
      topOffset: 0, // 上padding
      bottomOffset: 0 // 下 padding
    };
    this.start = 0;
    this.end = 0;
    this.height = 60;
    this.fakeData = new Array(100).fill("skr");
    this.scrollTop = 0;
    // 锚点 也就是记录第一个元素
    this.anchor = {
      top: 0,
      bottom: 0,
      index: 0
    };
    // 缓存数据
    this.cache = [];
  }
  componentDidMount() {
    // 获取可视区域显示子组件的个数
    this.count = Math.ceil(window.innerHeight / this.height);
    this.end = this.start + this.count;
    // 获取可视区域的数据
    this.getVDataHandle();
  }
  getVDataHandle() {
    const vData = this.fakeData.slice(this.start, this.end);
    // 计算上下padding 让滚动条看起来正常 为什么要用 this.end 因为 end是会动态变得
    const bottomOffset = (this.fakeData.length - this.end) * this.height;
    this.setState({
      vData,
      bottomOffset,
      topOffset: this.anchor.top
    });
    // 定义一个滚动事件
    window.addEventListener("scroll", this.handleScroll);
  }
  handleScroll = () => {
    if (!this.doc) {
      this.doc = window.document.body;
    }
    const scrollTop = window.scrollY;
    this.scrollTop = scrollTop;
    this.getIndex(scrollTop);
    this.getVDataHandle();
  };
  getIndex(scrollTop) {
    console.log(scrollTop);
    console.log(this.cache);
    const anchor = this.cache.find(item => item.bottom >= scrollTop);
    if (!anchor) {
      return;
    }
    this.anchor = { ...anchor };
    this.start = this.anchor.index;
    this.end = this.start + this.count;
  }
  // 通过子元素传递过来的数据
  cacheOffset = (el, index) => {
    // 计算 el元素的距离
    const rect = el.getBoundingClientRect();
    const top = rect.top + window.pageYOffset;
    this.cache.push({
      top,
      bottom: top + this.height,
      index
    });
  };
  render() {
    const { vData, topOffset, bottomOffset } = this.state;
    return (
      <div
        style={{
          paddingTop: `${topOffset}px`,
          paddingBottom: `${bottomOffset}px`
        }}
      >
        {vData.map((item, index) => {
          return (
            <Item
              key={this.start + index}
              index={this.start + index}
              cacheOffset={this.cacheOffset}
            ></Item>
          );
        })}
        <Item></Item>
      </div>
    );
  }
}

class Item extends Component {
  componentDidMount() {
    // 这里希望 把自己的位置 传递个父元素
    // this.props.cacheOffset(this.node, this.index);
    this.props.cacheOffset &&
      this.props.cacheOffset(this.node, this.props.index);
  }
  render() {
    return (
      <div
        className="item"
        ref={node => {
          return (this.node = node);
        }}
      >
        <p>{this.props.index}测试数据</p>
        <p>skr</p>
      </div>
    );
  }
}
