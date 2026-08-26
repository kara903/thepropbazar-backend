// ============================================================
// details.js v3 — Smooth Scroll Comparison Matrix
// 2-3 projects visible, smooth continuous horizontal scroll
// Row-based grid for perfect alignment
// ============================================================

(function () {
    'use strict';

    // ── Constants ──
    const SKIP_PROJECTS = ['Homeland', 'Independent Home', 'Land', 'Shree Haridarshan'];
    const BHK_KEYS = ['1BHK', '2BHK', '3BHK', '4BHK', '5BHK'];

    const STANDARD_AMENITIES = [
        { key: 'pool', label: 'Swimming Pool', icon: 'fa-water-ladder', css: 'pool', keywords: ['pool', 'swimming'] },
        { key: 'club', label: 'Club House', icon: 'fa-house', css: 'gym', keywords: ['club', 'clubhouse'] },
        { key: 'kids', label: 'Children Play Area', icon: 'fa-child-reaching', css: 'pool', keywords: ['play', 'children', 'kid', 'park', 'garden'] },
        { key: 'gym', label: 'Gymnasium', icon: 'fa-dumbbell', css: 'gym', keywords: ['gym', 'fitness'] },
        { key: 'amphitheater', label: 'Amphitheater', icon: 'fa-masks-theater', css: 'security', keywords: ['amphitheater', 'amphi theater', 'theatre', 'theater'] },
        { key: 'security', label: '24/7 Security & Power', icon: 'fa-shield-halved', css: 'security', keywords: ['security', 'power backup', 'cctv', 'gated'] },
        { key: 'parking', label: 'Ample Parking', icon: 'fa-car', css: 'parking', keywords: ['parking'] }
    ];

    const STANDARD_PROXIMITY = [
        { key: 'harKiPauri', label: 'Har Ki Pauri', icon: 'fa-place-of-worship', keywords: ['har ki pedi', 'har ki pauri'] },
        { key: 'busStation', label: 'Bus/Railway Station', icon: 'fa-train', keywords: ['bus/railway station', 'railway', 'bus'] },
        { key: 'highway', label: 'NH-58 Highway', icon: 'fa-road', keywords: ['nh- 58 highway', 'nh-58'] },
        { key: 'hospital', label: 'Hospital', icon: 'fa-hospital', keywords: ['hospital'] },
        { key: 'mall', label: 'Mall', icon: 'fa-cart-shopping', keywords: ['mall'] },
        { key: 'school', label: 'School / College', icon: 'fa-school', keywords: ['school / college', 'school', 'college'] },
        { key: 'shivalik', label: 'Shivalik Nagar', icon: 'fa-city', keywords: ['shivalik nagar'] },
        { key: 'petrol', label: 'Petrol Pump', icon: 'fa-gas-pump', keywords: ['petrol pump'] },
        { key: 'airport', label: 'Jolly Grant Airport', icon: 'fa-plane', keywords: ['jolly grand airport', 'jolly grant'] },
        { key: 'dehradun', label: 'Dehradun', icon: 'fa-location-dot', keywords: ['dehradun'] }
    ];

    // ── Helpers ──
    function getAvailableBHKTypes() {
        const types = new Set();
        for (const [name, project] of Object.entries(PROPERTY_DATA)) {
            if (SKIP_PROJECTS.includes(name)) continue;
            for (const key of BHK_KEYS) {
                if (project[key]) types.add(key);
            }
        }
        return BHK_KEYS.filter(k => types.has(k));
    }

    function getProjectsForType(bhkType) {
        const results = [];
        for (const [name, project] of Object.entries(PROPERTY_DATA)) {
            if (SKIP_PROJECTS.includes(name)) continue;
            if (project[bhkType]) {
                results.push({ name, bhkData: project[bhkType], society: project.society, type: bhkType });
            }
        }
        const order = {
            'Mantra Happy Homes': 1,
            'Deep Ganga': 2,
            'Jurs Country': 3,
            'Antriksh NRI City': 4,
            'Haridwar Greens': 5
        };
        results.sort((a, b) => {
            const indexA = order[a.name] || 99;
            const indexB = order[b.name] || 99;
            return indexA - indexB;
        });
        return results;
    }

    function checkAmenity(projectName, amenity) {
        if (projectName === 'Deep Ganga') {
            if (amenity.key === 'pool' || amenity.key === 'club' || amenity.key === 'gym') {
                return false;
            }
        }
        return true;
    }

    function convertKmToDriveTime(distStr) {
        if (!distStr || distStr === '—') return '—';
        const lower = distStr.toLowerCase();
        if (lower.includes('highway')) return "On Highway";
        if (lower.includes('inside') || lower.includes('campus')) return "Inside Campus";
        if (lower.includes('walking') || lower.includes('walk')) return "Walking Dist.";
        if (lower.includes('door') || lower.includes('gate')) return "At Doorstep";
        
        const numMatch = distStr.match(/(\d+(?:\.\d+)?)/);
        if (!numMatch) return distStr.replace(/\s*drive/gi, ' Min');
        
        const km = parseFloat(numMatch[1]);
        if (km <= 0.5) return "1 Min";
        if (km <= 1.0) return "2 Min";
        if (km <= 2.5) return "4 Min";
        if (km <= 5.0) return "8 Min";
        if (km <= 8.0) return "12 Min";
        if (km <= 11.0) return "15 Min";
        if (km <= 14.0) return "18 Min";
        if (km <= 18.0) return "22 Min";
        if (km <= 30.0) return "35 Min";
        return "45 Min";
    }

    function findProximity(society, proxItem) {
        if (!society?.connectivity) return '—';
        for (const c of society.connectivity) {
            const t = c.title.toLowerCase();
            if (proxItem.keywords.some(kw => t.includes(kw))) return convertKmToDriveTime(c.distance);
        }
        return '—';
    }

    function esc(str) {
        return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    }

    // ── BHK Tabs ──
    function renderTabs(availableTypes, activeType) {
        const container = document.getElementById('bhkTabsContainer');
        container.innerHTML = '';
        availableTypes.forEach(type => {
            const count = getProjectsForType(type).length;
            const btn = document.createElement('button');
            btn.className = 'bhk-tab' + (type === activeType ? ' active' : '');
            btn.innerHTML = `<span class="tab-label">${type}</span><span class="tab-count">${count}</span>`;
            btn.addEventListener('click', () => {
                if (type !== activeType) {
                    const url = new URL(window.location);
                    url.searchParams.set('type', type);
                    window.history.pushState({}, '', url);
                    renderPage(type, false);
                }
            });
            container.appendChild(btn);
        });
    }

    // ── Sticky Header Bar ──
    function renderHeaderBar(projects, colWidth) {
        const track = document.getElementById('stickyTrack');
        track.style.gridTemplateColumns = `repeat(${projects.length}, ${colWidth})`;
        track.innerHTML = projects.map((p, idx) => {
            const isLast = idx === projects.length - 1;
            return `
                <div class="header-cell${isLast ? ' last-col' : ''}">
                    <div class="project-name">${p.name}</div>
                    <div class="price-label">Starting From</div>
                    <div class="price-tag">${p.bhkData.price || 'Contact Us'}</div>
                </div>
            `;
        }).join('');
    }

    // ── Cell Renderers ──

    function cell(cls, html, isLast) {
        const div = document.createElement('div');
        div.className = `grid-cell ${cls}${isLast ? ' last-col' : ''}`;
        div.innerHTML = html;
        return div;
    }

    const selectedSizeIndices = {};

    function heroCell(p, isLast) {
        const img = p.society?.photos?.[0] || '';
        
        const locationMap = {
            'Deep Ganga': 'Roshanabad Tehsil, Haridwar',
            'Haridwar Greens': 'Roshanabad, Haridwar',
            'Antriksh NRI City': 'Pentagon Mall, Haridwar',
            'Jurs Country': 'NH-58, Haridwar',
            'Mantra Happy Homes': 'SIDCUL, Haridwar'
        };
        const loc = locationMap[p.name] || 'Haridwar';

        const titleHtml = `
            <div class="hero-project-info" style="text-align: left; margin-top: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--border-subtle, rgba(30,30,30,0.08));">
                
                <!-- Title (Left-Aligned, fixed height for row alignment across societies) -->
                <div style="font-family: 'Cormorant Garamond', serif; font-size: 1.85rem; font-weight: 700; color: #111; margin-bottom: 10px; line-height: 1.2; text-align: left; min-height: 48px; display: flex; align-items: center;">
                    ${p.name}
                </div>
                
                <!-- Info Section (Left-Aligned, uniform min-height so price boxes line up perfectly) -->
                <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; align-items: flex-start; justify-content: flex-start; min-height: 84px;">
                    <div style="font-family: 'Inter', sans-serif; font-size: 0.85rem; color: #666; display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-location-dot" style="color: #888; width: 14px; text-align: center;"></i> <span>${loc}</span>
                    </div>
                    <div style="font-family: 'Inter', sans-serif; font-size: 0.85rem; color: #444; display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-star" style="color: #FBBF24; width: 14px; text-align: center;"></i> <span>${p.society?.googleReviews || '4.0/5 (Google Reviews)'}</span>
                    </div>
                    <div style="font-family: 'Inter', sans-serif; font-size: 0.85rem; color: #444; display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-calendar-check" style="color: var(--emerald, #059669); width: 14px; text-align: center;"></i> 
                        <span>${p.society?.deliveredYear ? (p.society.deliveredYear.includes('Under Construction') ? 'Status: Under Construction' : 'Delivered Year: ' + p.society.deliveredYear) : 'Delivered: Fully Ready'}</span>
                    </div>
                </div>
                
                <!-- Price Box (Left-Aligned, 100% width for perfect alignment) -->
                <div style="background: rgba(5, 150, 105, 0.05); padding: 12px 16px; border-radius: 8px; border: 1px solid rgba(5, 150, 105, 0.12); text-align: left; width: 100%; box-sizing: border-box;">
                    <div style="font-family: 'Inter', sans-serif; font-size: 0.7rem; color: #666; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; font-weight: 600;">
                        ${p.type || ''} Starting From
                    </div>
                    <div style="font-family: 'Inter', sans-serif; font-size: 1.55rem; font-weight: 800; color: var(--emerald, #059669); line-height: 1.2;">
                        ${p.bhkData.price || 'Contact Us'}
                    </div>
                </div>
                
            </div>
        `;

        if (img) {
            return cell('cell-hero', `
                <div class="hero-img-wrap">
                    <img src="${img}" alt="${p.name}" loading="lazy">
                    <span class="possession-badge"><i class="fa-solid fa-check-circle"></i> Ready to Move</span>
                </div>
                ${titleHtml}`, isLast);
        }
        return cell('cell-hero', `
            <div class="no-media-placeholder"><i class="fa-solid fa-image"></i>Image coming soon</div>
            ${titleHtml}
        `, isLast);
    }

    function specsCell(p, isLast) {
        const d = p.bhkData;
        const sizes = (d.sizes && d.sizes.length > 0) ? d.sizes : [{ size: d.size || 'Standard', price: d.price || 'Contact Us', layoutImage: '', photos: d.flatPhotos || [], videos: d.flatVideos || [] }];
        const currentIdx = selectedSizeIndices[p.name] !== undefined ? selectedSizeIndices[p.name] : 0;
        const count = sizes.length;
        const bhkTitle = p.type || '2BHK';
        const sizeCountText = `There are ${count} size${count > 1 ? 's' : ''} of ${bhkTitle} here.`;

        const sizeButtonsHtml = sizes.map((s, idx) => {
            const isActive = idx === currentIdx;
            return `
                <button class="size-pill-btn${isActive ? ' active' : ''}" onclick="selectProjectSize('${esc(p.name)}', ${idx})">
                    <i class="fa-solid fa-ruler-horizontal"></i> ${s.size}
                </button>
            `;
        }).join('');

        const brochureBtnHtml = `
            <button class="brochure-download-btn" onclick="handleBrochureDownload('${esc(p.name)}', '${esc(p.type)}')">
                <i class="fa-solid fa-file-pdf"></i> Download Brochure
            </button>
        `;

        return cell('cell-specs', `
            <div class="row-label"><i class="fa-solid fa-ruler-combined"></i> DIMENSIONS & SPECS</div>
            <div class="specs-size-container">
                <div class="size-options-header" style="text-align: center; justify-content: center;">
                    <span class="size-options-title" style="font-size: 0.85rem; font-weight: 700; color: #374151; text-transform: none; letter-spacing: normal;">${sizeCountText}</span>
                </div>
                <div class="size-buttons-group" style="justify-content: center;">
                    ${sizeButtonsHtml}
                </div>
                <div class="specs-actions" style="display: flex; justify-content: center;">
                    ${brochureBtnHtml}
                </div>
            </div>
        `, isLast);
    }

    function renderMainViewerHtml(item, currentIdx = 0, totalCount = 1) {
        const badgeHtml = `<div class="media-type-badge">
            <i class="fa-solid ${item.type === 'video' ? 'fa-video' : 'fa-camera'}"></i> 
            <span>${currentIdx + 1} / ${totalCount}</span>
        </div>`;

        if (item.type === 'video') {
            const isYouTube = item.src.includes('youtube.com') || item.src.includes('youtu.be');
            let videoElement = `<video src="${item.src}" controls playsinline preload="none"></video>`;
            if (isYouTube) {
                let videoId = '';
                if (item.src.includes('/shorts/')) {
                    videoId = item.src.split('/shorts/')[1].split('?')[0];
                } else if (item.src.includes('v=')) {
                    videoId = item.src.split('v=')[1].split('&')[0];
                } else if (item.src.includes('youtu.be/')) {
                    videoId = item.src.split('youtu.be/')[1].split('?')[0];
                }
                videoElement = `<div class="plyr-player-init" data-plyr-provider="youtube" data-plyr-embed-id="${videoId}" style="border-radius: 12px; overflow: hidden; height: 100%;"></div>`;
            } else {
                videoElement = `<video class="plyr-player-init" src="${item.src}" controls playsinline preload="none" style="border-radius: 12px; height: 100%; width: 100%;"></video>`;
            }
            return `
                <div class="media-video-wrap">
                    ${badgeHtml}
                    ${videoElement}
                </div>
            `;
        } else {
            return `
                <div class="media-img-wrap" onclick="openLightbox('${esc(item.src)}')">
                    ${badgeHtml}
                    <img src="${item.src}" alt="Property view" loading="lazy">
                    <div class="zoom-overlay"><i class="fa-solid fa-magnifying-glass-plus"></i> Click to Enlarge</div>
                </div>
            `;
        }
    }

    function createInteractiveGallery(projectName, cellType, title, iconClass, videos, photos, isLast) {
        const mediaItems = [];
        if (photos) {
            photos.forEach(p => mediaItems.push({ type: 'image', src: p }));
        }
        if (videos) {
            videos.forEach(v => mediaItems.push({ type: 'video', src: v }));
        }

        if (mediaItems.length === 0) {
            return cell('cell-media', `
                <div class="row-label"><i class="fa-solid ${iconClass}"></i> ${title}</div>
                <div class="no-media-placeholder">
                    <i class="fa-solid fa-photo-film"></i>
                    <span>Media coming soon</span>
                </div>
            `, isLast);
        }

        const galleryId = `gallery-${cellType}-${projectName.replace(/[^a-zA-Z0-9]/g, '-')}`;
        const mediaItemsJson = encodeURIComponent(JSON.stringify(mediaItems));

        let html = `
            <div class="row-label"><i class="fa-solid ${iconClass}"></i> ${title}</div>
            <div class="interactive-gallery" id="${galleryId}" data-media="${mediaItemsJson}">
                <div class="gallery-main">
                    ${renderMainViewerHtml(mediaItems[0], 0, mediaItems.length)}
                </div>
                <div class="gallery-thumbs">
                    ${mediaItems.map((item, idx) => `
                        <button class="gallery-thumb ${idx === 0 ? 'active' : ''}" 
                                data-index="${idx}" 
                                onclick="switchGalleryMedia('${galleryId}', ${idx})"
                                aria-label="View media ${idx + 1}">
                            ${item.type === 'video' 
                                ? `<div class="thumb-video-overlay"><i class="fa-solid fa-play"></i></div>
                                   <div class="thumb-video-placeholder"><i class="fa-solid fa-video"></i><span>Video</span></div>` 
                                : `<img src="${item.src}" alt="photo" loading="lazy" onerror="this.closest('.gallery-thumb').style.display='none'">`
                            }
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        return cell('cell-media', html, isLast);
    }

    function flatMediaCell(p, isLast) {
        const d = p.bhkData;
        const sizes = (d.sizes && d.sizes.length > 0) ? d.sizes : null;
        const currentIdx = selectedSizeIndices[p.name] !== undefined ? selectedSizeIndices[p.name] : 0;
        const activeSize = sizes ? (sizes[currentIdx] || sizes[0]) : null;

        let photos = [];
        let videos = [];

        if (activeSize) {
            if (activeSize.layoutImage) {
                photos.push(activeSize.layoutImage);
            }
            if (activeSize.photos && activeSize.photos.length > 0) {
                photos.push(...activeSize.photos);
            }
            if (activeSize.videos && activeSize.videos.length > 0) {
                videos.push(...activeSize.videos);
            }
        }

        if (photos.length === 0 && videos.length === 0) {
            photos = (d.flatPhotos && d.flatPhotos.length > 0) ? d.flatPhotos : [];
            videos = (d.flatVideos && d.flatVideos.length > 0) ? d.flatVideos : [];
            if (photos.length === 0 && videos.length === 0 && p.society) {
                photos = (p.society.photos && p.society.photos.length > 1) ? p.society.photos.slice(1) : [];
                videos = p.society.videos || [];
            }
        }

        const currentSizeLabel = activeSize ? ` (${activeSize.size})` : '';
        return createInteractiveGallery(p.name, 'flat', `VIEW SIZE${currentSizeLabel}`, 'fa-ruler-combined', videos, photos, isLast);
    }

    function societyMediaCell(p, isLast) {
        const s = p.society;
        const photos = (s?.photos && s.photos.length > 1) ? s.photos.slice(1) : [];
        return createInteractiveGallery(p.name, 'society', 'Spectacular Aerial & Society Views', 'fa-building', s?.videos, photos, isLast);
    }

    function amenitiesCell(p, isLast) {
        let count = 0;
        STANDARD_AMENITIES.forEach(am => { if (checkAmenity(p.name, am)) count++; });

        let h = `
            <div class="row-label-wrap">
                <div class="row-label"><i class="fa-solid fa-sparkles"></i> FACILITIES & LIFESTYLE</div>
                <span class="amenity-score-badge ${count >= 5 ? 'score-high' : 'score-mid'}">
                    <i class="fa-solid fa-circle-check"></i> ${count} of ${STANDARD_AMENITIES.length} Available
                </span>
            </div>
            <div class="amenity-grid">
        `;

        STANDARD_AMENITIES.forEach(am => {
            const has = checkAmenity(p.name, am);
            h += `
                <div class="amenity-card ${has ? 'available' : 'unavailable'}">
                    <div class="amenity-card-left">
                        <span class="amenity-icon-box ${am.key}">
                            <i class="fa-solid ${am.icon}"></i>
                        </span>
                        <div class="amenity-text">
                            <span class="amenity-title">${am.label}</span>
                            <span class="amenity-sub">${has ? 'Premium Lifestyle' : 'Not Included'}</span>
                        </div>
                    </div>
                    <span class="amenity-status-pill ${has ? 'status-yes' : 'status-no'}">
                        <i class="fa-solid ${has ? 'fa-check' : 'fa-minus'}"></i>
                        <span>${has ? 'Included' : 'No'}</span>
                    </span>
                </div>
            `;
        });
        h += '</div>';
        return cell('cell-amenities', h, isLast);
    }

    function proximityCell(p, isLast) {
        let h = `
            <div class="row-label-wrap">
                <div class="row-label"><i class="fa-solid fa-car-side"></i> PROXIMITY & DRIVE TIME</div>
            </div>
            <div class="proximity-grid">
        `;
        STANDARD_PROXIMITY.forEach(px => {
            const dist = findProximity(p.society, px);
            h += `
                <div class="proximity-card">
                    <div class="prox-card-left">
                        <span class="prox-icon-box">
                            <i class="fa-solid ${px.icon}"></i>
                        </span>
                        <span class="prox-name">${px.label}</span>
                    </div>
                    <span class="prox-distance-pill"><i class="fa-solid fa-clock"></i> ${dist}</span>
                </div>
            `;
        });
        h += '</div>';
        return cell('cell-proximity', h, isLast);
    }

    function locationVideoCell(p, isLast) {
        let videoSrc = '';
        videoSrc = '';
        
        let contentHtml = '';
        if (videoSrc) {
            let videoId = videoSrc.split('youtu.be/')[1];
            contentHtml = `
                <div class="media-video-wrap" style="height: 250px; margin-top: 10px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <div class="plyr-player-init" data-plyr-provider="youtube" data-plyr-embed-id="${videoId}" style="height: 100%; width: 100%;"></div>
                </div>
            `;
        } else {
            contentHtml = `
                <div class="no-media-placeholder" style="height: 250px; margin-top: 10px; border-radius: 12px;">
                    <i class="fa-solid fa-video-slash"></i>
                    <span>Location Video Coming Soon</span>
                </div>
            `;
        }

        // Dynamic Google Maps location link per project
        const mapLinks = {
            'Mantra Happy Homes': 'https://www.google.com/maps/search/?api=1&query=Mantra+Happy+Homes+Haridwar',
            'Jurs Country': 'https://www.google.com/maps/search/?api=1&query=Jurs+Country+Haridwar',
            'Haridwar Greens': 'https://www.google.com/maps/search/?api=1&query=Haridwar+Greens+Roshanabad+Haridwar',
            'Deep Ganga': 'https://www.google.com/maps/search/?api=1&query=Deep+Ganga+Apartments+Sector+5A+SIDCUL+Haridwar',
            'Antriksh NRI City': 'https://www.google.com/maps/search/?api=1&query=Antriksh+NRI+City+Sector+9+SIDCUL+Haridwar',
            'My Home Land': 'https://www.google.com/maps/search/?api=1&query=Denso+Chowk+SIDCUL+Haridwar',
            'Shree Hari Darshan City': 'https://www.google.com/maps/search/?api=1&query=Bahadrabad+Toll+Plaza+NH-58+Haridwar'
        };
        const mapLink = mapLinks[p.name] || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name + ' Haridwar')}`;

        contentHtml += `
            <a href="${mapLink}" target="_blank" class="maps-btn" style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 15px; padding: 12px; background: linear-gradient(135deg, #4285F4, #34A853); color: white; border-radius: 8px; text-decoration: none; font-weight: 600; font-family: 'Outfit', sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: transform 0.3s ease, box-shadow 0.3s ease;">
                <i class="fa-solid fa-map-location-dot"></i> Reach Here
            </a>
        `;

        let h = `
            <div class="row-label-wrap">
                <div class="row-label"><i class="fa-solid fa-map-location"></i> WHERE IS LOCATION</div>
            </div>
            ${contentHtml}
        `;
        return cell('cell-location', h, isLast);
    }

    // ── Main Render ──
    function renderPage(activeType, preserveScroll = false) {
        const availableTypes = getAvailableBHKTypes();
        if (!availableTypes.includes(activeType)) activeType = availableTypes[0] || '2BHK';

        document.title = `Compare ${activeType} Flats — The Propbazar Haridwar`;
        renderTabs(availableTypes, activeType);

        const projects = getProjectsForType(activeType);
        const grid = document.getElementById('compGrid');
        const scrollEl = document.getElementById('compScroll');
        const savedScroll = preserveScroll && scrollEl ? scrollEl.scrollLeft : 0;

        grid.innerHTML = '';
        document.querySelector('.empty-state')?.remove();

        if (projects.length === 0) {
            grid.style.display = 'none';
            const stickyBar = document.getElementById('stickyBar');
            if (stickyBar) stickyBar.style.display = 'none';
            const scrollHint = document.getElementById('scrollHint');
            if (scrollHint) scrollHint.style.display = 'none';
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.innerHTML = `<i class="fa-solid fa-building-circle-xmark"></i>
                <h2>No ${activeType} Options Available</h2>
                <p>No projects with ${activeType} right now.</p>
                <a href="/" onclick="renderPage('2BHK'); return false;">← View 2 BHK Projects</a>`;
            scrollEl.parentNode.appendChild(empty);
            return;
        }

        grid.style.display = 'grid';
        document.getElementById('stickyBar').style.display = 'block';

        // Column width — calculate dynamically so no ugly empty space on right
        const totalProjects = projects.length;
        const screenWidth = window.innerWidth || document.documentElement.clientWidth || 1024;
        
        let colWidth;
        if (screenWidth >= 1200) {
            if (totalProjects <= 2) {
                colWidth = `calc(100% / ${totalProjects})`;
            } else if (totalProjects === 3) {
                colWidth = `calc(100% / 3)`;
            } else {
                colWidth = '420px';
            }
        } else if (screenWidth >= 768) {
            if (totalProjects <= 2) {
                colWidth = `calc(100% / ${totalProjects})`;
            } else {
                colWidth = '380px';
            }
        } else {
            if (totalProjects === 1) {
                colWidth = '100vw';
            } else {
                colWidth = 'clamp(300px, 86vw, 400px)';
            }
        }

        grid.style.gridTemplateColumns = `repeat(${totalProjects}, ${colWidth})`;
        if (totalProjects <= 2 || (screenWidth >= 1200 && totalProjects <= 3)) {
            grid.style.width = '100%';
        } else {
            grid.style.width = 'max-content';
        }

        // Sticky header
        renderHeaderBar(projects, colWidth);


        // ── Render rows (row by row for alignment) ──
        projects.forEach((p, idx) => {
            const isLast = idx === projects.length - 1;
            grid.appendChild(heroCell(p, isLast));
        });
        projects.forEach((p, idx) => {
            const isLast = idx === projects.length - 1;
            grid.appendChild(specsCell(p, isLast));
        });
        projects.forEach((p, idx) => {
            const isLast = idx === projects.length - 1;
            grid.appendChild(flatMediaCell(p, isLast));
        });
        projects.forEach((p, idx) => {
            const isLast = idx === projects.length - 1;
            grid.appendChild(societyMediaCell(p, isLast));
        });
        projects.forEach((p, idx) => {
            const isLast = idx === projects.length - 1;
            grid.appendChild(amenitiesCell(p, isLast));
        });
        projects.forEach((p, idx) => {
            const isLast = idx === projects.length - 1;
            grid.appendChild(proximityCell(p, isLast));
        });
        projects.forEach((p, idx) => {
            const isLast = idx === projects.length - 1;
            grid.appendChild(locationVideoCell(p, isLast));
        });

        // Initialize Plyr for all newly rendered video elements
        if (typeof Plyr !== 'undefined') {
            setTimeout(() => {
                document.querySelectorAll('.plyr-player-init:not(.plyr-initialized)').forEach(el => {
                    new Plyr(el, {
                        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen']
                    });
                    el.classList.add('plyr-initialized');
                });
            }, 100);
        }

        // Setup smooth scroll sync for header
        setupScrollSync();

        // Restore or reset horizontal scroll
        if (preserveScroll && scrollEl) {
            scrollEl.scrollLeft = savedScroll;
            const headerTrack = document.getElementById('stickyTrack');
            if (headerTrack) headerTrack.style.transform = `translateX(-${savedScroll}px)`;
        } else if (scrollEl) {
            scrollEl.scrollLeft = 0;
            const headerTrack = document.getElementById('stickyTrack');
            if (headerTrack) headerTrack.style.transform = `translateX(0px)`;
        }

        // Mobile swipe hint (nudge to show horizontal scroll on first visit)
        if (!preserveScroll && window.innerWidth <= 768 && !sessionStorage.getItem('swipeHintShown')) {
            sessionStorage.setItem('swipeHintShown', 'true');
            setTimeout(() => {
                scrollEl.scrollTo({ left: 80, behavior: 'smooth' });
                setTimeout(() => {
                    scrollEl.scrollTo({ left: 0, behavior: 'smooth' });
                }, 400);
            }, 800);
        }
    }

    // ── Scroll Sync: Header tracks horizontal scroll smoothly ──
    let isScrollSyncSetup = false;
    function setupScrollSync() {
        if (isScrollSyncSetup) return;
        const scrollEl = document.getElementById('compScroll');
        const headerTrack = document.getElementById('stickyTrack');
        if (!scrollEl || !headerTrack) return;

        scrollEl.addEventListener('scroll', () => {
            headerTrack.style.transform = `translateX(-${scrollEl.scrollLeft}px)`;
        }, { passive: true });
        isScrollSyncSetup = true;
    }

    // ── Sticky Header Compact on Vertical Scroll ──
    function initStickyCompact() {
        const stickyBar = document.getElementById('stickyBar');
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.scrollY > 120;
                    stickyBar.classList.toggle('compact', scrolled);
                    stickyBar.classList.toggle('has-shadow', scrolled);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // ── Browser back/forward ──
    window.addEventListener('popstate', () => {
        const p = new URLSearchParams(window.location.search);
        renderPage(p.get('type') || '2BHK');
    });

    // ── Global switch function for galleries ──
    window.switchGalleryMedia = function (galleryId, idx) {
        const gallery = document.getElementById(galleryId);
        if (!gallery) return;

        const mediaItems = JSON.parse(decodeURIComponent(gallery.dataset.media));
        const activeItem = mediaItems[idx];
        const mainViewer = gallery.querySelector('.gallery-main');
        if (!mainViewer || !activeItem) return;

        // Update active class on thumbnails
        gallery.querySelectorAll('.gallery-thumb').forEach((t, i) => {
            t.classList.toggle('active', i === idx);
        });

        const badgeHtml = `<div class="media-type-badge">
            <i class="fa-solid ${activeItem.type === 'video' ? 'fa-video' : 'fa-camera'}"></i> 
            <span>${idx + 1} / ${mediaItems.length}</span>
        </div>`;

        // Smooth opacity transition
        mainViewer.style.opacity = '0.3';
        setTimeout(() => {
            if (activeItem.type === 'video') {
                const isYouTube = activeItem.src.includes('youtube.com') || activeItem.src.includes('youtu.be');
                let videoElement = `<video src="${activeItem.src}" controls autoplay playsinline></video>`;
                if (isYouTube) {
                    let videoId = '';
                    if (activeItem.src.includes('/shorts/')) {
                        videoId = activeItem.src.split('/shorts/')[1].split('?')[0];
                    } else if (activeItem.src.includes('v=')) {
                        videoId = activeItem.src.split('v=')[1].split('&')[0];
                    } else if (activeItem.src.includes('youtu.be/')) {
                        videoId = activeItem.src.split('youtu.be/')[1].split('?')[0];
                    }
                    videoElement = `<div class="plyr-player-init" data-plyr-provider="youtube" data-plyr-embed-id="${videoId}" style="border-radius: 12px; overflow: hidden; height: 100%;"></div>`;
                } else {
                    videoElement = `<video class="plyr-player-init" src="${activeItem.src}" controls autoplay playsinline style="border-radius: 12px; height: 100%; width: 100%;"></video>`;
                }
                mainViewer.innerHTML = `
                    <div class="media-video-wrap">
                        ${badgeHtml}
                        ${videoElement}
                    </div>
                `;
            } else {
                mainViewer.innerHTML = `
                    <div class="media-img-wrap" onclick="openLightbox('${esc(activeItem.src)}')">
                        ${badgeHtml}
                        <img src="${activeItem.src}" alt="Property view">
                        <div class="zoom-overlay"><i class="fa-solid fa-magnifying-glass-plus"></i> Click to Enlarge</div>
                    </div>
                `;
            }
            mainViewer.style.opacity = '1';

            // Initialize Plyr for newly loaded media
            if (activeItem.type === 'video' && typeof Plyr !== 'undefined') {
                setTimeout(() => {
                    const el = mainViewer.querySelector('.plyr-player-init:not(.plyr-initialized)');
                    if (el) {
                        new Plyr(el, {
                            controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
                            youtube: { noCookie: false, rel: 0, showinfo: 0, iv_load_policy: 3, modestbranding: 1 }
                        });
                        el.classList.add('plyr-initialized');
                    }
                }, 50);
            }
        }, 120);
    };

    // ── Global Size Selection Handler ──
    window.selectProjectSize = function (projectName, sizeIdx) {
        selectedSizeIndices[projectName] = sizeIdx;
        const params = new URLSearchParams(window.location.search);
        renderPage(params.get('type') || '2BHK', true);
    };

    // ── Global Brochure Download Handler ──
    window.handleBrochureDownload = function (projectName, bhkType) {
        const project = PROPERTY_DATA[projectName];
        const bhkData = project?.[bhkType];
        const brochureUrl = bhkData?.brochureUrl || project?.brochureUrl || '';

        if (brochureUrl) {
            const a = document.createElement('a');
            a.href = brochureUrl;
            a.download = `${projectName.replace(/\s+/g, '_')}_Brochure.pdf`;
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            const phone = "919897588881";
            const msg = encodeURIComponent(`नमस्ते The Propbazar टीम, मुझे ${projectName} (${bhkType}) का आधिकारिक ब्रोशर / PDF चाहिए। कृपया शेयर करें।`);
            window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
        }
    };

    // ── Init ──
    const params = new URLSearchParams(window.location.search);
    renderPage(params.get('type') || '2BHK');
    initStickyCompact();

})();

// ============================================================
// LIGHTBOX (global)
// ============================================================
window.openLightbox = function(src) {
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    if (!lb) return;
    img.src = src;
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
}

window.closeLightbox = function() {
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    lb.classList.remove('active');
    document.body.style.overflow = 'auto';
}

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('lightboxClose');
    const lb = document.getElementById('lightbox');
    if (btn) btn.addEventListener('click', closeLightbox);
    if (lb) lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
});
