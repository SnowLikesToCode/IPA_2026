/**
 * IPA Documentation Framework - Main JavaScript
 * 
 * Provides client-side functionality for the documentation site:
 * - Mobile navigation toggle
 * - Glossary tooltip handling
 * - Smooth scrolling for anchor links
 * - Table of contents highlighting
 */

(function() {
  'use strict';

  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initGlossaryTooltips();
    initSmoothScroll();
    initTocHighlight();
  });

  /**
   * Mobile Navigation Toggle
   */
  function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!navToggle || !navMenu) return;

    navToggle.addEventListener('click', function() {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('is-open');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('is-open');
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('is-open');
      }
    });
  }

  /**
   * Glossary Tooltips
   */
  function initGlossaryTooltips() {
    const glossaryTerms = document.querySelectorAll('.glossary-term');
    
    glossaryTerms.forEach(function(term) {
      const tooltip = term.querySelector('.glossary-tooltip');
      if (!tooltip) return;

      // Position tooltip
      term.addEventListener('mouseenter', function() {
        positionTooltip(term, tooltip);
        tooltip.classList.add('visible');
      });

      term.addEventListener('mouseleave', function() {
        tooltip.classList.remove('visible');
      });

      // Keyboard accessibility
      const link = term.querySelector('.glossary-link');
      if (link) {
        link.addEventListener('focus', function() {
          positionTooltip(term, tooltip);
          tooltip.classList.add('visible');
        });

        link.addEventListener('blur', function() {
          tooltip.classList.remove('visible');
        });
      }
    });
  }

  /**
   * Position tooltip to stay within viewport
   */
  function positionTooltip(term, tooltip) {
    const termRect = term.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    // Reset position
    tooltip.style.left = '50%';
    tooltip.style.transform = 'translateX(-50%)';

    // Check if tooltip goes off screen
    const tooltipLeft = termRect.left + (termRect.width / 2) - (tooltipRect.width / 2);
    const tooltipRight = tooltipLeft + tooltipRect.width;

    if (tooltipLeft < 10) {
      tooltip.style.left = '0';
      tooltip.style.transform = 'translateX(0)';
    } else if (tooltipRight > viewportWidth - 10) {
      tooltip.style.left = 'auto';
      tooltip.style.right = '0';
      tooltip.style.transform = 'translateX(0)';
    }
  }

  /**
   * Smooth Scrolling for Anchor Links
   */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(event) {
        const targetId = this.getAttribute('href').slice(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          event.preventDefault();
          
          const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          // Update URL without jumping
          history.pushState(null, null, '#' + targetId);
        }
      });
    });
  }

  /**
   * Table of Contents Active State Highlighting
   */
  function initTocHighlight() {
    const toc = document.querySelector('.toc-content, .section-toc');
    if (!toc) return;

    const headings = document.querySelectorAll('h2[id], h3[id], h4[id]');
    const tocLinks = toc.querySelectorAll('a[href^="#"]');
    
    if (headings.length === 0 || tocLinks.length === 0) return;

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          
          tocLinks.forEach(function(link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + id) {
              link.classList.add('active');
            }
          });
        }
      });
    }, {
      rootMargin: '-80px 0px -80% 0px',
      threshold: 0
    });

    headings.forEach(function(heading) {
      observer.observe(heading);
    });
  }

  /**
   * Copy Code Button (for code blocks)
   */
  function initCodeCopy() {
    document.querySelectorAll('pre code').forEach(function(codeBlock) {
      const pre = codeBlock.parentElement;
      
      const copyButton = document.createElement('button');
      copyButton.className = 'copy-button';
      copyButton.textContent = 'Copy';
      copyButton.setAttribute('aria-label', 'Copy code to clipboard');
      
      copyButton.addEventListener('click', function() {
        navigator.clipboard.writeText(codeBlock.textContent).then(function() {
          copyButton.textContent = 'Copied!';
          setTimeout(function() {
            copyButton.textContent = 'Copy';
          }, 2000);
        });
      });
      
      pre.style.position = 'relative';
      pre.appendChild(copyButton);
    });
  }

  // Initialize code copy buttons
  document.addEventListener('DOMContentLoaded', initCodeCopy);

})();
