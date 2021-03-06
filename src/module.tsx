import * as PropTypes from "prop-types";
import * as React from "react";
import {ComponentType} from "react";
import {Model, Module, MetaData, ModelStore, GetModule, ModuleGetter} from "./global";
import {invalidview} from "./store";

function isPromiseModule(module: Module | Promise<Module>): module is Promise<Module> {
  return typeof module["then"] === "function";
}
function isPromiseView(moduleView: ComponentType<any> | Promise<ComponentType<any>>): moduleView is Promise<ComponentType<any>> {
  return typeof moduleView["then"] === "function";
}
function getView<M extends Module, N extends Extract<keyof M["views"], string>>(getModule: GetModule<M>, viewName: N): M["views"][N] | Promise<M["views"][N]> {
  const result = getModule();
  if (isPromiseModule(result)) {
    return result.then(module => module.views[viewName]);
  } else {
    return result.views[viewName];
  }
}

export function loadModel<M extends Module>(getModule: GetModule<M>): Promise<M["model"]> {
  const result = getModule();
  if (isPromiseModule(result)) {
    return result.then(module => module.model);
  } else {
    return Promise.resolve(result.model);
  }
}
interface State {
  Component: ComponentType<any> | null;
}

export type ReturnViews<T extends () => any> = T extends () => Promise<Module<Model, infer R>> ? R : never;

export function loadView<MG extends ModuleGetter, M extends Extract<keyof MG, string>, V extends ReturnViews<MG[M]>, N extends Extract<keyof V, string>>(moduleGetter: MG, moduleName: M, viewName: N, loadingComponent: React.ReactNode = null): V[N] {
  return class Loader extends React.Component {
    public state: State = {
      Component: null,
    };
    public shouldComponentUpdate(nextProps: any, nextState: State) {
      return nextState.Component !== this.state.Component;
    }
    public componentWillMount() {
      const moduleViewResult = getView(moduleGetter[moduleName], viewName);
      if (isPromiseView(moduleViewResult)) {
        moduleViewResult.then(Component => {
          this.setState({
            Component,
          });
        });
      } else {
        this.setState({
          Component: moduleViewResult,
        });
      }
    }

    public render() {
      const {Component} = this.state;
      return Component ? <Component {...this.props} /> : loadingComponent;
    }
  } as any;
}

export function exportView<C extends ComponentType<any>>(ComponentView: C, model: Model, viewName: string = "Main"): C {
  const Comp = ComponentView as any;
  return class PureComponent extends React.PureComponent {
    public static contextTypes = {
      store: PropTypes.object,
    };
    public componentWillMount() {
      if (MetaData.isBrowser) {
        // ssr数据流是单向的，model->view
        const {store}: {store: ModelStore} = this.context;
        model(store);
        const currentViews = store.reactCoat.currentViews;
        if (!currentViews[model.namespace]) {
          currentViews[model.namespace] = {[viewName]: 1};
        } else {
          const views = currentViews[model.namespace];
          if (!views[viewName]) {
            views[viewName] = 1;
          } else {
            views[viewName]++;
          }
        }
        invalidview();
      }
    }
    public componentWillUnmount() {
      if (MetaData.isBrowser) {
        const {store}: {store: ModelStore} = this.context;
        const currentViews = store.reactCoat.currentViews;
        if (currentViews[model.namespace] && currentViews[model.namespace][viewName]) {
          currentViews[model.namespace][viewName]--;
        }
        invalidview();
      }
    }
    public render() {
      return <Comp {...this.props} />;
    }
  } as any;
}

/*
let autoId: number = 0;
export function exportView<C extends ComponentType<any>>(ComponentView: C, model: Model): C {
  const Comp = ComponentView as any;
  return class PureComponent extends React.PureComponent {
    private uid: string = (autoId++).toString();
    public static contextTypes = {
      store: PropTypes.object,
    };
    public render() {
      return <Comp {...this.props} />;
    }
    public componentWillMount() {
      const {store} = this.context;
      (model as InternalModel)(store, this.uid);
    }
    public componentWillUnmount() {
      const {store} = this.context;
      (model as InternalModel)(store, this.uid, true);
    }
  } as any;
}

export function exportModel(namespace: string, HandlersClass: {new (): BaseModuleHandlers<BaseModuleState, RootState>}): Model {
  return async (store: ModelStore, viewName?: string, unmount?: boolean) => {
    const hasInjected = store.reactCoat.injectedModules[namespace];
    if (!hasInjected) {
      store.reactCoat.injectedModules[namespace] = viewName ? {[viewName]: true} : {};
      const handlers = new HandlersClass();
      (handlers as any).namespace = namespace;
      (handlers as any).store = store;
      const actions = injectActions(store, namespace, handlers as any);
      const hasInited = Boolean(store.getState()[namespace]);
      if (!hasInited) {
        const initAction = actions.INIT((handlers as any).initState);
        await store.dispatch(initAction);
      }
      if (viewName) {
        console.log("mount", namespace, "first Inject", hasInited);
        return store.dispatch(actions.MOUNT());
      }
    } else {
      const actions = getModuleActionCreatorList(namespace);
      if (unmount && viewName) {
        delete hasInjected[viewName];
        if (Object.keys(hasInjected).length === 0) {
          return store.dispatch(actions.UNMOUNT());
        }
      } else if (viewName) {
        if (Object.keys(hasInjected).length === 0) {
          console.log("mount", namespace, "hasInjected");
          hasInjected[viewName] = true;
          return store.dispatch(actions.MOUNT());
        } else {
          hasInjected[viewName] = true;
        }
      }
    }
    return void 0;
  };
*/
