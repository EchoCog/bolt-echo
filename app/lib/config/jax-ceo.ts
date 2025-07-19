/*
 * JAX CEO Integration Utility
 * This file provides utilities for integrating JAX CEO functionality into the bolt.diy app
 */

import { singleUserConfig } from './single-user';

// JAX CEO specific capabilities and features
export const jaxCeoCapabilities = {
  strategicPlanning: true,
  executiveDecisionMaking: true,
  technicalExpertise: true,
  businessInsight: true,
  cognitiveOrchestration: true,
};

// JAX CEO UI customization
export const jaxCeoUICustomization = {
  primaryColor: '#3a0ca3', // Deep purple for executive feel
  secondaryColor: '#4cc9f0', // Bright blue accent
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  logoText: 'JAX CEO',
  subtitleText: 'Cognitive Execution Orchestration',
};

// Helper function to check if JAX CEO mode is enabled
export const isJaxCeoMode = () => true; // Always enabled in this simplified version

// Helper function to get JAX CEO configuration
export const getJaxCeoConfig = () => {
  return {
    ...singleUserConfig,
    assistantName: 'JAX CEO',
    assistantDescription: 'Cognitive Execution Orchestration',
    capabilities: jaxCeoCapabilities,
    ui: jaxCeoUICustomization,
  };
};

export default getJaxCeoConfig;
