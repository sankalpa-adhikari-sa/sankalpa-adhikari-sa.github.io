/**
 * SEO Utility Functions
 *
 * Pure functions for generating SEO metadata.
 * All configuration comes from getConfig().
 */

import type { ImageMetadata } from 'astro'

export interface SEOData {
  title: string
  description?: string
  image?: ImageMetadata
  pubDate?: Date
  updatedDate?: Date
  tags?: string[]
}

/**
 * Validate and sanitize SEO data
 */
export function validateSEOData(data: Partial<SEOData>): SEOData {
  return {
    title: data.title || 'Untitled',
    description: data.description,
    image: data.image,
    tags: data.tags || [],
  }
}
