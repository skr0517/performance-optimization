import React, { Component } from "react";

export default class VirtualList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // 由于只显示视窗的一些数据 滚动条会有些奇怪（很短），所以我们要设置上下的padding来让滚动条看起来是正常的
      topOffset: 0,
      bottomOffset: 0,
      vData: [] //视图的数据
    };
    // 开始的位置
    this.start = 0;
    // 结束的索引
    this.end = 0;
    // 滚动的距离
    this.scrollTop = 0;
    this.doc = null;
    //假数据
    this.fakeData = new Array(100).fill("skr");
    this.height = 60;

    // 缓存 每个元素的位置，要不重复计算太多了
    this.cache = [];
    // 锚点 顶部元素
    this.anchor = {
      index: 0, //索引
      top: 0, // 顶部偏移量
      bottom: 0 //底部偏移量
    };
  }
  componentDidMount() {
    // 计算到底那些元素可以渲染
    this.count = Math.ceil(window.innerHeight / this.height);
    this.end = this.start + this.count;
    // 更新可视区域的数据
    this.upDataVisableData();
  }
  upDataVisableData() {
    const vData = this.fakeData.slice(this.start, this.end);
    // 每次滚动的时候也要出发 还可以做节流防抖 滚动时每50毫秒出发
    // 通过改变topoffset 和bottomOffset 让滚动条看起来是正常的
    this.setState({
      vData,
      topOffset: this.anchor.top,
      bottomOffset: (this.fakeData.length - this.end) * this.height
    });

    //滚动事件
    window.addEventListener("scroll", this.handleScroll);
  }
  handleScroll = () => {
    if (!this.doc) {
      this.doc = window.document.body;
    }
    // 获取 滚动的距离
    const scrollTop = window.scrollY;
    // 计算start和end索引
    this.getIndex(scrollTop);
    this.upDataVisableData();

    //跟新 可视区域 数据
    this.scrollTop = scrollTop;
  };
  // 获取索引
  getIndex(scrollTop = 0) {
    // 查找最新该出现的anchor
    // this.cache.forEach(item => {
    //   console.log(item.bottom + "------" + scrollTop);
    // });
    const anchor = this.cache.find(item => item.bottom >= scrollTop);
    if (!anchor) {
      return;
    }
    this.anchor = { ...anchor };
    console.log(anchor.index);
    this.start = this.anchor.index;
    this.end = this.start + this.count;
    // 让start 等于当前视窗的第一个 可以让锚点元素都是最新值
    // this.start =
  }
  cacheOffset = (ele, index) => {
    //   获取当前 方块的位置
    const rect = ele.getBoundingClientRect();
    const top = rect.top + window.pageYOffset;
    this.cache.push({
      index,
      top,
      bottom: top + this.height
    });
  };
  render() {
    const { topOffset, bottomOffset, vData } = this.state;
    return (
      //   渲染的容器
      <div className="container">
        {/*可滑动的  需要设置一些padding 来匹配视图  */}
        <div
          style={{
            paddingTop: `${topOffset}px`,
            paddingBottom: `${bottomOffset}px`
          }}
        >
          {/* 渲染的真正的数据 */}
          {vData.map((item, index) => {
            return (
              <Item
                key={this.start + index}
                index={this.start + index}
                cacheOffset={this.cacheOffset}
              ></Item>
            );
          })}
        </div>
      </div>
    );
  }
}

class Item extends Component {
  componentDidMount() {
    // 这里 希望，元素渲染完毕后，把自己当前的位置传递个父元素，方便做定位。
    this.props.cacheOffset(this.node, this.props.index);
  }
  render() {
    return (
      // 定高60写死
      <div className="item" ref={node => (this.node = node)}>
        <p>{this.props.index}skr</p>
        <p>测试数据</p>
      </div>
    );
  }
}
