/* global XMLHttpRequest */
// this code is a replicate of the answer from https://stackoverflow.com/a/47097746

const cssVarPoly = {
  init: function () {
    // first lets see if the browser supports CSS variables
    // No version of IE supports window.CSS.supports, so if that isn't supported in the first place we know CSS variables is not supported
    // Edge supports supports, so check for actual variable support
    if (window.CSS && window.CSS.supports && window.CSS.supports('(--foo: red)')) {
      // this browser does support variables, abort
      return
    } else {
      // edge barfs on console statements if the console is not open... lame!
      if (!document.querySelector('body')) {
        console.warn('<body> is not initialized yet')
        return
      }
      if (document.querySelector('body').classList.contains('cssvars-polyfilled')) {
        cssVarPoly.removePrevious()
      }
      document.querySelector('body').classList.add('cssvars-polyfilled')
    }

    cssVarPoly.ratifiedVars = {}
    cssVarPoly.varsByBlock = {}
    cssVarPoly.oldCSS = {}

    // start things off
    cssVarPoly.findCSS()
    cssVarPoly.updateCSS()
  },

  // find all the css blocks, save off the content, and look for variables
  findCSS: function () {
    const styleBlocks = document.querySelectorAll('style:not(.inserted),link[type="text/css"]')

    // we need to track the order of the style/link elements when we save off the CSS, set a counter
    let counter = 1;

    // loop through all CSS blocks looking for CSS variables being set
    [].forEach.call(styleBlocks, function (block) {
      let theCSS
      if (block.nodeName === 'STYLE') {
        theCSS = block.innerHTML
        cssVarPoly.findSetters(theCSS, counter)
      } else if (block.nodeName === 'LINK') {
        cssVarPoly.getLink(block.getAttribute('href'), counter, function (counter, request) {
          cssVarPoly.findSetters(request.responseText, counter)
          cssVarPoly.oldCSS[counter] = request.responseText
          cssVarPoly.updateCSS()
        })
        theCSS = ''
      }
      // save off the CSS to parse through again later. the value may be empty for links that are waiting for their ajax return, but this will maintain the order
      cssVarPoly.oldCSS[counter] = theCSS
      counter++
    })
  },

  // find all the "--variable: value" matches in a provided block of CSS and add them to the master list
  findSetters: function (theCSS, counter) {
    cssVarPoly.varsByBlock[counter] = theCSS.match(/(--.+:.+;)/g) || []
  },

  // run through all the CSS blocks to update the variables and then inject on the page
  updateCSS: function () {
    // first lets loop through all the variables to make sure later vars trump earlier vars
    cssVarPoly.ratifySetters(cssVarPoly.varsByBlock)

    // loop through the css blocks (styles and links)
    for (const curCSSID in cssVarPoly.oldCSS) {
      const newCSS = cssVarPoly.replaceGetters(cssVarPoly.oldCSS[curCSSID], cssVarPoly.ratifiedVars)
      // put it back into the page
      // first check to see if this block exists already
      if (document.querySelector('#inserted' + curCSSID)) {
        document.querySelector('#inserted' + curCSSID).innerHTML = newCSS
      } else {
        var style = document.createElement('style')
        style.type = 'text/css'
        style.innerHTML = newCSS
        style.classList.add('inserted')
        style.id = 'inserted' + curCSSID
        document.getElementsByTagName('head')[0].appendChild(style)
      }
    };
  },

  // parse a provided block of CSS looking for a provided list of variables and replace the --var-name with the correct value
  replaceGetters: function (curCSS, varList) {
    for (const theVar in varList) {
      // match the variable with the actual variable name
      const getterRegex = new RegExp('var\\(\\s*' + theVar + '\\s*\\)', 'g')
      curCSS = curCSS.replace(getterRegex, varList[theVar])

      // now check for any getters that are left that have fallbacks
      const getterRegex2 = new RegExp('var\\(\\s*.+\\s*,\\s*(.+)\\)', 'g')
      const matches = curCSS.match(getterRegex2)
      if (matches) {
        matches.forEach(function (match) {
          // find the fallback within the getter
          curCSS = curCSS.replace(match, match.match(/var\(.+,\s*(.+)\)/)[1])
        })
      }

      // curCSS = curCSS.replace(getterRegex2,varList[theVar]);
    };
    return curCSS
  },

  // determine the css variable name value pair and track the latest
  ratifySetters: function (varList) {
    // loop through each block in order, to maintain order specificity
    for (const curBlock in varList) {
      const curVars = varList[curBlock]
      // loop through each var in the block
      curVars.forEach(function (theVar) {
        // split on the name value pair separator
        const matches = theVar.split(/:\s*/)
        // put it in an object based on the varName. Each time we do this it will override a previous use and so will always have the last set be the winner
        // 0 = the name, 1 = the value, strip off the ; if it is there
        cssVarPoly.ratifiedVars[matches[0]] = matches[1].replace(/;/, '')
      })
    };
  },

  // get the CSS file (same domain for now)
  getLink: function (url, counter, success) {
    const request = new XMLHttpRequest()
    request.open('GET', url, true)
    request.overrideMimeType('text/css;')
    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        if (typeof success === 'function') {
          success(counter, request)
        }
      } else {
        // We reached our target server, but it returned an error
        console.warn('an error was returned from:', url)
      }
    }

    request.onerror = function () {
      // There was a connection error of some sort
      console.warn('we could not get anything from:', url)
    }

    request.send()
  },

  // remove previous css if any exists
  removePrevious: function () {
    const styles = document.head.querySelectorall('.inserted'); let i

    for (i = 0; i < divs.length; ++i) {
      document.head.removeChild(divs[i])
    }

    document.querySelector('body').classList.remove('cssvars-polyfilled')
  }

}

export default cssVarPoly

// need to call init function to run
// cssVarPoly.init()
