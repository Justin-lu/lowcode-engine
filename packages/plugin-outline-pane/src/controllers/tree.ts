import TreeNode from './tree-node';
import { IPublicModelNode, IPublicModelPluginContext } from '@alilc/lowcode-types';

export class Tree {
  private treeNodesMap = new Map<string, TreeNode>();

  readonly id: string | undefined;

  readonly pluginContext: IPublicModelPluginContext;

  get root(): TreeNode | null {
    if (this.pluginContext.project.currentDocument?.focusNode) {
      return this.getTreeNode(this.pluginContext.project.currentDocument.focusNode!);
    }
    return null;
  }

  constructor(pluginContext: IPublicModelPluginContext) {
    this.pluginContext = pluginContext;
    const doc = this.pluginContext.project.currentDocument;
    this.id = doc?.id;

    doc?.onChangeNodeChildren((info: {node: IPublicModelNode }) => {
      const { node } = info;
      const treeNode = this.getTreeNodeById(node.id);
      treeNode?.notifyExpandableChanged();
    });
  }

  setNodeSelected(nodeId: string): void {
    // 目标节点选中，其他节点展开
    const treeNode = this.treeNodesMap.get(nodeId);
    if (!treeNode) {
      return;
    }
    this.expandAllAncestors(treeNode);
  }

  getTreeNode(node: IPublicModelNode): TreeNode {
    if (this.treeNodesMap.has(node.id)) {
      const tnode = this.treeNodesMap.get(node.id)!;
      tnode.setNode(node);
      return tnode;
    }

    const treeNode = new TreeNode(this, node, this.pluginContext);
    this.treeNodesMap.set(node.id, treeNode);
    return treeNode;
  }

  getTreeNodeById(id: string) {
    return this.treeNodesMap.get(id);
  }

  expandAllAncestors(treeNode: TreeNode | undefined | null) {
    if (!treeNode) {
      return;
    }
    if (treeNode.isRoot()) {
      return;
    }
    const ancestors = [];
    let currentNode: TreeNode | null | undefined = treeNode;
    while (!treeNode.isRoot()) {
      currentNode = currentNode?.parent;
      if (currentNode) {
        ancestors.unshift(currentNode);
      } else {
        break;
      }
    }
    ancestors.forEach((ancestor) => {
      ancestor.setExpanded(true);
    });
  }

  expandAllDecendants(treeNode: TreeNode | undefined | null) {
    if (!treeNode) {
      return;
    }
    treeNode.setExpanded(true);
    const children = treeNode && treeNode.children;
    if (children) {
      children.forEach((child) => {
        this.expandAllDecendants(child);
      });
    }
  }

  collapseAllDecendants(treeNode: TreeNode | undefined | null): void {
    if (!treeNode) {
      return;
    }
    treeNode.setExpanded(false);
    const children = treeNode && treeNode.children;
    if (children) {
      children.forEach((child) => {
        this.collapseAllDecendants(child);
      });
    }
  }
}
