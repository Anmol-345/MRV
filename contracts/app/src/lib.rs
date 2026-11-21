#![no_std]

pub mod types;

use sails_rs::prelude::*;

pub struct BluTokenProgram;

#[sails_rs::program]
impl BluTokenProgram {
    pub fn new() -> Self {
        Self
    }
}
