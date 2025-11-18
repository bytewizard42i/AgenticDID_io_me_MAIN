use crate::{utils, Hasher};
use alloc::vec;
use parity_scale_codec::{Decode, Encode};
use std::{boxed::Box, fmt::Debug, println, vec::Vec};

#[derive(Clone, PartialEq, Eq, Encode, Decode)]
pub enum ProofNode<Hash> {
    Leaf(Hash),
    Node(Vec<Box<ProofNode<Hash>>>), // size of 2
}

impl<T: Clone> ProofNode<T> {
    pub(crate) fn new_node(left_opt: Option<Self>, right_opt: Option<Self>) -> Option<Self> {
        let Some(left) = left_opt else {
            // if left does not exist, return the right node
            return right_opt;
        };

        match right_opt {
            // merge left and right
            Some(right) => {
                let children = vec![Box::new(left), Box::new(right)];
                Some(ProofNode::<T>::Node(children))
            }
            // return left node
            None => Some(left),
        }
    }

    // Returns a Depth First Search iterator
    pub fn as_dfs_iterator(&self) -> DfsIterator<T> {
        let stack = vec![self];

        DfsIterator { stack }
    }
}

pub trait Encoder {
    fn encode(&self) -> Vec<u8>;
}

pub trait Decoder {
    fn decode(&self) -> Vec<u8>;
}

/// Returns a temporary list of Proof Nodes, representing the next (upper) proof layer.
pub(crate) fn temp_proof_layer<T: Hasher>(
    current_layer: Vec<Option<ProofNode<T::Hash>>>,
) -> Vec<Option<ProofNode<T::Hash>>> {
    let current_layer_len = current_layer.len();

    let mut upper_layer = vec![];
    let mut right_index = 1;

    // start on 1, to be able to get both left and right nodes
    while right_index < current_layer_len {
        let left_index = right_index - 1;

        // create a new node, comprising the left and right nodes
        let left = current_layer[left_index].clone();
        let right = current_layer[right_index].clone();
        let new_node = ProofNode::new_node(left, right);

        // push up to a layer above the current layer
        upper_layer.push(new_node);

        // move to the next 2 nodes
        right_index += 2;
    }

    // for odd-numbered list (odd number of leaves), just copy the last node
    if current_layer.len() % 2 != 0 {
        upper_layer.push(current_layer[current_layer_len - 1].clone());
    }

    upper_layer
}

/// A Depth First Search iterator
pub struct DfsIterator<'a, T> {
    stack: Vec<&'a ProofNode<T>>,
}

/// Items returned when iterating the Proof Tree
pub enum ProofItem<Hash> {
    Leaf(Hash),
    // Reached a variant of an enum with children having Nodes
    // Harmless variant; continue calling `next()`
    Next,
    Children(Vec<Hash>),
}

impl<T> ProofItem<T> {
    pub fn into_leaf(proof: ProofNode<T>) -> Option<Self> {
        match proof {
            ProofNode::Leaf(leaf) => Some(ProofItem::Leaf(leaf)),
            ProofNode::Node(_) => None,
        }
    }
}

impl<T: Clone> Iterator for DfsIterator<'_, T> {
    type Item = ProofItem<T>;

    fn next(&mut self) -> Option<Self::Item> {
        if let Some(node) = self.stack.pop() {
            match node {
                ProofNode::Leaf { .. } => return ProofItem::into_leaf(node.clone()),
                ProofNode::Node(proof_nodes) => match proof_nodes.as_slice() {
                    [left_child, right_child] => {
                        match (left_child.as_ref(), right_child.as_ref()) {
                            (ProofNode::Leaf(l_leaf), ProofNode::Leaf(r_leaf)) => {
                                return Some(ProofItem::Children(vec![
                                    l_leaf.clone(),
                                    r_leaf.clone(),
                                ]));
                            }
                            _ => {}
                        }
                        // Popping front of vec is costly; pushing the right child FIRST will
                        // allow popping the left child FIRST.
                        self.stack.push(&right_child.as_ref());
                        self.stack.push(&left_child.as_ref());

                        return Some(ProofItem::Next);
                    }
                    [one_child] => {
                        if let ProofNode::Leaf(hash) = one_child.as_ref() {
                            return Some(ProofItem::Leaf(hash.clone()));
                        }

                        self.stack.push(&one_child.as_ref());
                    }
                    _ => {
                        println!("warning, this variant is not applicable");
                    }
                },
            }
        }
        None
    }
}

impl<T: Clone + Into<Vec<u8>>> Debug for ProofNode<T> {
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        match self {
            ProofNode::Leaf(hash) => write!(f, "{}", utils::collections::to_hex_string(hash)),
            ProofNode::Node(layer_trees) => f.debug_list().entries(layer_trees.iter()).finish(),
        }
    }
}
