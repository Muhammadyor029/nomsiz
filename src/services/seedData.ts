import { VaultFile } from '../types';

export const INITIAL_SAMPLE_FILES: VaultFile[] = [
  {
    id: 'f_arch_spec_01',
    customId: 'arch-spec-2026',
    name: 'quantum_resilience_architecture.pdf',
    originalName: 'quantum_resilience_architecture.pdf',
    size: 4280512, // ~4.1 MB
    mimeType: 'application/pdf',
    category: 'document',
    extension: 'pdf',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    deletedAt: null,
    isFavorite: true,
    isTrash: false,
    tags: ['security', 'cryptography', 'spec'],
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    textContent: `# Sovereign Cloud Architecture
Version 4.2.0 • Confidential
Classification: Vault Level 5

1. SYSTEM INVARIANTS
This document describes the offline cryptographic boundary model for client-side encrypted storage.

2. KEY ROTATION SPECIFICATION
- Curve: X25519 for ephemeral key agreements
- Digest: SHA3-512 with HMAC integrity proofs
- Salt Entropy: 256-bit hardware-derived seeds

3. DATA RETENTION & SHREDDING
All deleted entities follow NIST SP 800-88 Rev. 1 cryptographic erasure standards.`,
    metadata: {
      checksum: 'sha256-a94f82c0b891e32d',
    },
  },
  {
    id: 'f_neural_script_py',
    customId: 'core-pipeline',
    name: 'neural_latent_sampler.py',
    originalName: 'neural_latent_sampler.py',
    size: 24576, // 24 KB
    mimeType: 'text/x-python',
    category: 'code',
    extension: 'py',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    deletedAt: null,
    isFavorite: true,
    isTrash: false,
    tags: ['python', 'ml', 'pipeline'],
    url: '',
    textContent: `"""
Velum Latent Sampler Engine
Confidential • Personal Vault Project
"""

import numpy as np
import torch
import torch.nn as nn
from typing import Optional, Tuple

class LiquidLatentProjector(nn.Module):
    def __init__(self, dim_in: int = 1024, dim_out: int = 512, dropout: float = 0.05):
        super().__init__()
        self.norm = nn.LayerNorm(dim_in)
        self.dense = nn.Linear(dim_in, dim_out, bias=False)
        self.gelu = nn.GELU()
        self.dropout = nn.Dropout(dropout)
        
    def forward(self, x: torch.Tensor, mask: Optional[torch.Tensor] = None) -> torch.Tensor:
        """Projects high-dimensional manifold vectors into compact sphere."""
        h = self.norm(x)
        h = self.dense(h)
        h = self.gelu(h)
        if mask is not None:
            h = h * mask.unsqueeze(-1)
        return self.dropout(h)

def compute_spherical_distance(vec_a: torch.Tensor, vec_b: torch.Tensor) -> float:
    a_norm = vec_a / torch.norm(vec_a, dim=-1, keepdim=True)
    b_norm = vec_b / torch.norm(vec_b, dim=-1, keepdim=True)
    cosine_sim = torch.sum(a_norm * b_norm, dim=-1)
    return float(torch.arccos(torch.clamp(cosine_sim, -1.0, 1.0)).mean())

if __name__ == "__main__":
    print("[+] Initializing Liquid Projector...")
    projector = LiquidLatentProjector(dim_in=768, dim_out=256)
    sample_tensor = torch.randn(4, 32, 768)
    out = projector(sample_tensor)
    print(f"[✓] Projected manifold shape: {out.shape}")
`,
    metadata: {
      lines: 39,
      checksum: 'sha256-3b92f701c9',
    },
  },
  {
    id: 'f_soundtrack_ambient',
    customId: 'audio-nocturne',
    name: 'obsidian_frequency_master.wav',
    originalName: 'obsidian_frequency_master.wav',
    size: 28416000, // 28.4 MB
    mimeType: 'audio/wav',
    category: 'audio',
    extension: 'wav',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    deletedAt: null,
    isFavorite: false,
    isTrash: false,
    tags: ['master', 'soundtrack', 'lossless'],
    url: 'https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3',
    metadata: {
      duration: 184, // 3:04
      checksum: 'sha256-f84918e7d2',
    },
  },
  {
    id: 'f_visual_monolith',
    customId: 'render-monolith-4k',
    name: 'spatial_refraction_dark.png',
    originalName: 'spatial_refraction_dark.png',
    size: 8912896, // 8.9 MB
    mimeType: 'image/png',
    category: 'image',
    extension: 'png',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    deletedAt: null,
    isFavorite: true,
    isTrash: false,
    tags: ['render', 'visual', 'liquid-glass'],
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=70',
    metadata: {
      width: 3840,
      height: 2160,
      checksum: 'sha256-4c810f92ab',
    },
  },
  {
    id: 'f_video_timelapse',
    customId: 'timelapse-tokyo-raw',
    name: 'kinetic_fluid_motion_60fps.mp4',
    originalName: 'kinetic_fluid_motion_60fps.mp4',
    size: 47185920, // 47.1 MB
    mimeType: 'video/mp4',
    category: 'video',
    extension: 'mp4',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    deletedAt: null,
    isFavorite: false,
    isTrash: false,
    tags: ['video', 'fluid', 'motion'],
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=70',
    metadata: {
      width: 1920,
      height: 1080,
      duration: 15,
      checksum: 'sha256-789a4cd01',
    },
  },
  {
    id: 'f_archive_backup',
    customId: 'cold-storage-tar',
    name: 'identity_keys_bundle_v2.tar.gz',
    originalName: 'identity_keys_bundle_v2.tar.gz',
    size: 15728640, // 15.7 MB
    mimeType: 'application/gzip',
    category: 'archive',
    extension: 'tar.gz',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    deletedAt: null,
    isFavorite: false,
    isTrash: false,
    tags: ['keys', 'gpg', 'backup'],
    url: '',
    metadata: {
      checksum: 'sha256-5e01b38f8',
    },
  },
  {
    id: 'f_vault_env_config',
    customId: 'infra-env-2026',
    name: 'production_cluster.config.json',
    originalName: 'production_cluster.config.json',
    size: 8192,
    mimeType: 'application/json',
    category: 'code',
    extension: 'json',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 150).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 150).toISOString(),
    deletedAt: null,
    isFavorite: false,
    isTrash: false,
    tags: ['json', 'config'],
    url: '',
    textContent: `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "vaultCluster": "node-primary-sg1",
  "storageProvider": "sovereign-blobstore",
  "encryption": {
    "cipher": "ChaCha20-Poly1305",
    "keyDerivation": "Argon2id",
    "memoryCostKb": 65536,
    "timeCost": 3,
    "parallelism": 4
  },
  "replication": {
    "minimumQuorum": 2,
    "geographicalNodes": ["sgp-01", "tyo-02", "fra-04"]
  },
  "limits": {
    "maxPayloadBytes": 10737418240,
    "chunkSizeBytes": 16777216
  }
}`,
    metadata: {
      lines: 21,
      checksum: 'sha256-91b72a44d',
    },
  },
  {
    id: 'f_trashed_draft_notes',
    customId: 'old-draft-notes',
    name: 'deprecated_deprecated_credentials.txt',
    originalName: 'deprecated_deprecated_credentials.txt',
    size: 1024,
    mimeType: 'text/plain',
    category: 'document',
    extension: 'txt',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 200).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    deletedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isFavorite: false,
    isTrash: true,
    tags: ['scratchpad'],
    url: '',
    textContent: `Legacy credentials superseded by hardware security module.
Safe to delete permanently upon next pruning cycle.`,
    metadata: {
      lines: 2,
    },
  },
];
