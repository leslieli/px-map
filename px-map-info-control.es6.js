(function(){
  'use strict';

  class PxMapInfoControl {
    /* Name for the component */
    get is() { return 'px-map-info-control'; }

    /* Behaviors to import for this component */
    get behaviors() {
      return [
        window.PxMapBehavior.ElementInstance,
        window.PxMapBehavior.ControlInstance
      ];
    }

    get parentListeners() {
      return {
        'px-map-info-control-bind' : '_handleInfoControlBind',
        'px-map-info-control-unbind' : '_handleInfoControlUnbind'
      }
    }

    /* Properties for this component */
    get properties() {
      return {
        /**
         * A name for the control. Will be used by elements on the map to send
         * messages to a specific control. This name should be unique among
         * all controls, unless you want multiple controls to recieve the
         * same message.
         *
         * @type {String}
         */
        name: {
          type: String,
          notify: true
        },

        /**
         * The maximum width (in pixels) to set for the info box. Do not include
         * the units (e.g. set to '300' not '300px').
         *
         * @type {String}
         */
        maxWidth: {
          type: String,
          value: '300'
        },

        /**
         * The maximum height (in pixels) to set for the info box. Do not include
         * the units (e.g. set to '300' not '300px'). Do not set to allow the
         * popup to grow to fit its children.
         *
         * @type {String}
         */
        maxHeight: {
          type: String
        },

        /**
         * Stringified HTML to set as the info box's content. Changing the content
         * will update the info box.
         *
         * @type {String}
         */
        content: {
          type: String,
          observer: '_updateInfoControlContent'
        },

        /**
         * Is `true` if the info box is hidden. Can be set to change the info box's
         * visibility, or listened to for updates on its visibility.
         *
         * @type {Boolean}
         */
        hidden: {
          type: Boolean,
          value: false,
          notify: true,
          observer: '_updateInfoControlVisibility'
        },

        /**
         * Automatically hides the info box when its content is empty, and shows
         * it when its content is not empty.
         *
         * @type {Boolean}
         */
        autoHide: {
          type: Boolean,
          value: true
        }
      }
    }

    _createElementInstance() {
      const options = this._getInfoControlOptions();
      return L.Control.controlBox(options);
    }

    _getInfoControlOptions(defaults={}) {
      const options = defaults;

      options.position = this._formatPosition(this.position || '') || undefined;
      options.content = this._getInfoControlContent();
      options.className = 'map-info-control';
      // If autoHide is on, and the content is empty, tell the info box to make
      // itself hidden on load
      if (this.autoHide && !options.content.length) {
        options.autoOpen = false;
        this.set('hidden', true);
      } else {
        options.autoOpen = true;
      }

      return options;
    }

    _updateInfoControlContent() {
      if (!this.elementInstance) return;

      const content = this._getInfoControlContent();
      this.elementInstance.setContent(content);

      if (this.autoHide) {
        this._autoHideOrShowInfoControl();
      }
    }

    _autoHideOrShowInfoControl() {
      if (!this.autoHide) return;

      if (!this._content || !this._content.length) {
        this.set('hidden', true);
      } else {
        this.set('hidden', false);
      }
    }

    _updateInfoControlVisibility() {
      if (!this.elementInstance) return;

      if (this.hidden) {
        this.elementInstance.closeBox();
      } else {
        this.elementInstance.openBox();
      }
    }

    _getInfoControlContent() {
      this._content = this.content || '';
      return this._content;
    }

    _handleInfoControlBind(evt) {
      if (evt.detail && evt.detail.control === this.name) {
        evt.stopPropagation();

        this.set('content', evt.detail.content || '');
        if (evt.detail.popup) this.listen(evt.detail.popup, 'px-map-popup-content-changed', '_handlePopupChanged');
      }
    }

    _handleInfoControlUnbind(evt) {
      if (evt.detail && evt.detail.control === this.name) {
        evt.stopPropagation();

        this.set('content', evt.detail.content || '');
        if (evt.detail.popup) this.unlisten(evt.detail.popup, 'px-map-popup-content-changed', '_handlePopupChanged');
      }
    }

    _handlePopupChanged(evt) {
      if (evt.detail && evt.detail.content) {
        evt.stopPropagation();

        this.set('content', evt.detail.content || '');
      }
    }
  }

  /* Register this component with the Polymer constructor. */
  Polymer(PxMapInfoControl);
})();