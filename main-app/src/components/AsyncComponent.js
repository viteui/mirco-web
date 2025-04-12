import { h, defineComponent } from 'vue';
import { microLoader } from '../loader';

export const AsyncComponent = defineComponent({
  name: 'AsyncComponent',
  props: {
    name: {
      type: String,
      required: true
    }
  },
  
  data() {
    return {
      component: null
    }
  },

  async mounted() {
    // 等待组件加载完成
    const waitForComponent = () => {
      return new Promise((resolve) => {
        const checkComponent = () => {
          const component = microLoader.getComponent(this.name);
          console.log('component', component);
          if (component) {
            resolve(component);
          } else {
            setTimeout(checkComponent, 100);
          }
        };
        checkComponent();
      });
    };
    console.log('this.name', this.name);
    this.component = await waitForComponent();
    console.log('component', this.component);
    this.$forceUpdate();
  },

  render() {
    if (!this.component) {
      return h('div', { class: 'loading' }, '加载中...');
    }
    return h(this.component);
  }
}); 