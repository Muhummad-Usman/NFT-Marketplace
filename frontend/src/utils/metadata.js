// Parse NFT metadata from URI or JSON string
export async function parseNFTMetadata(tokenURI) {
  try {
    let metadata;
    
    if (tokenURI.startsWith('http')) {
      // Fetch metadata from HTTP URL
      const response = await fetch(tokenURI);
      metadata = await response.json();
    } else if (tokenURI.startsWith('ipfs://')) {
      // Convert IPFS URI to HTTP gateway URL
      const ipfsUrl = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
      const response = await fetch(ipfsUrl);
      metadata = await response.json();
    } else if (tokenURI.startsWith('data:application/json')) {
      // Parse data URL
      const base64Data = tokenURI.split(',')[1];
      const jsonStr = atob(base64Data);
      metadata = JSON.parse(jsonStr);
    } else {
      // Try to parse as JSON string
      metadata = JSON.parse(tokenURI);
    }
    
    return {
      success: true,
      metadata: normalizeMetadata(metadata),
    };
  } catch (error) {
    console.error('Error parsing NFT metadata:', error);
    return {
      success: false,
      error: error.message,
      metadata: null,
    };
  }
}

// Normalize metadata to ensure consistent structure
function normalizeMetadata(metadata) {
  return {
    name: metadata.name || 'Unknown NFT',
    description: metadata.description || 'No description available',
    image: metadata.image || metadata.image_url || null,
    audio: metadata.audio || metadata.audio_url || null,
    video: metadata.video || metadata.video_url || null,
    animation_url: metadata.animation_url || null,
    attributes: metadata.attributes || metadata.properties || [],
    external_url: metadata.external_url || null,
    background_color: metadata.background_color || null,
    created_at: metadata.created_at || metadata.createdAt || null,
    mediaType: determineMediaType(metadata),
  };
}

// Determine the primary media type of the NFT
function determineMediaType(metadata) {
  if (metadata.video || metadata.video_url || metadata.animation_url) {
    return 'video';
  } else if (metadata.audio || metadata.audio_url) {
    return 'audio';
  } else if (metadata.image || metadata.image_url) {
    return 'image';
  }
  return 'unknown';
}

// Get the primary media URL for display
export function getMediaURL(metadata) {
  if (!metadata) return null;
  
  if (metadata.video) return metadata.video;
  if (metadata.video_url) return metadata.video_url;
  if (metadata.animation_url) return metadata.animation_url;
  if (metadata.audio) return metadata.audio;
  if (metadata.audio_url) return metadata.audio_url;
  if (metadata.image) return metadata.image;
  if (metadata.image_url) return metadata.image_url;
  
  return null;
}

// Get a fallback image URL for non-image NFTs
export function getFallbackImageURL(metadata) {
  if (!metadata) return null;
  
  const mediaType = determineMediaType(metadata);
  
  if (mediaType === 'audio') {
    return 'https://ipfs.io/ipfs/QmXZxLkNvxhZq8x6kFbLpVEXJb4vK6NqZ3kF7a9qL3q9mN/audio-placeholder.png';
  } else if (mediaType === 'video') {
    return 'https://ipfs.io/ipfs/QmXZxLkNvxhZq8x6kFbLpVEXJb4vK6NqZ3kF7a9qL3q9mN/video-placeholder.png';
  }
  
  return null;
}

// Format attributes for display
export function formatAttributes(attributes) {
  if (!Array.isArray(attributes)) return [];
  
  return attributes.map(attr => ({
    trait_type: attr.trait_type || attr.key || 'Property',
    value: attr.value || attr.trait_value || 'Unknown',
    display_type: attr.display_type || null,
  }));
}

// Render media component based on type
export function renderMedia(metadata, className = '') {
  if (!metadata) return null;
  
  const mediaType = determineMediaType(metadata);
  const mediaURL = getMediaURL(metadata);
  
  if (!mediaURL) {
    return (
      <div className={`nft-placeholder ${className}`}>
        <span>No media available</span>
      </div>
    );
  }
  
  switch (mediaType) {
    case 'video':
      return (
        <video 
          className={`nft-media ${className}`}
          controls
          poster={getFallbackImageURL(metadata)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        >
          <source src={mediaURL} type="video/mp4" />
          <source src={mediaURL} type="video/webm" />
          Your browser does not support video.
        </video>
      );
    
    case 'audio':
      return (
        <div className={`nft-audio-container ${className}`}>
          <img 
            src={getFallbackImageURL(metadata)} 
            alt="Audio NFT" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <audio 
            controls 
            style={{ 
              position: 'absolute', 
              bottom: '10px', 
              left: '10px', 
              right: '10px',
              backgroundColor: 'rgba(0,0,0,0.7)',
              borderRadius: '4px'
            }}
          >
            <source src={mediaURL} type="audio/mpeg" />
            <source src={mediaURL} type="audio/wav" />
            <source src={mediaURL} type="audio/ogg" />
            Your browser does not support audio.
          </audio>
        </div>
      );
    
    case 'image':
    default:
      return (
        <img 
          src={mediaURL} 
          alt={metadata.name} 
          className={`nft-media ${className}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.src = 'https://ipfs.io/ipfs/QmXZxLkNvxhZq8x6kFbLpVEXJb4vK6NqZ3kF7a9qL3q9mN/image-placeholder.png';
          }}
        />
      );
  }
}

// Check if URL is accessible
export async function checkMediaAccessibility(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Get file extension from URL
export function getFileExtension(url) {
  if (!url) return null;
  
  const pathname = new URL(url).pathname;
  const extension = pathname.split('.').pop().toLowerCase();
  
  return extension;
}

// Validate media format
export function isValidMediaFormat(url, type) {
  const extension = getFileExtension(url);
  
  const validFormats = {
    image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    audio: ['mp3', 'wav', 'ogg', 'm4a', 'aac'],
    video: ['mp4', 'webm', 'ogg', 'mov', 'avi'],
  };
  
  return validFormats[type]?.includes(extension) || false;
}
