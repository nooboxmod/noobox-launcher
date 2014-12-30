'use strict';

var MobileOperator = {
  BRAZIL_MCC: '724',
  BRAZIL_CELLBROADCAST_CHANNEL: 50,

  // tcl_longxiuping add for bug 753648.
  Control_Display_SPN_And_PLMN: 0x00,

  userFacingInfo: function mo_userFacingInfo(mobileConnection) {
    var network = mobileConnection.voice.network;
    var iccid = mobileConnection.iccId;
    var iccObj = navigator.mozIccManager.getIccById(iccid);
    var iccInfo = iccObj ? iccObj.iccInfo : null;
    //tcl_longxiuping modify for bug_608547
    //jrd_yang.chen modify bug_407548
    //var operator = network ? (network.shortName || network.longName) : null;
    var operator = network ? (network.longName || network.shortName) : null;

// liukun@tcl.com modify according to TS 22.101 Annex A and TS 51.011 10.3.11
    /*if (operator && iccInfo && iccInfo.isDisplaySpnRequired && iccInfo.spn &&
        !mobileConnection.voice.roaming) {
      if (iccInfo.isDisplayNetworkNameRequired && operator !== iccInfo.spn) {
        operator = operator + ' ' + iccInfo.spn;
      } else {
        operator = iccInfo.spn;
      }
    }*/
    /*if (operator && iccInfo && iccInfo.isDisplaySpnRequired && iccInfo.spn) {
      if (iccInfo.isDisplayNetworkNameRequired) {
        operator = operator + ' ' + iccInfo.spn;
      } else {
        operator = iccInfo.spn;
      }
    }
    */
// liukun end

    // tcl_longxiuping add for bug 753648 begin.

    // Control how to display SPN and PLMN on status bar and lock screen.
    // 0x00: default behavior following 3GPP spec.;
    // 0x01: display SPN only if the SPN exists in sim card and not empty;
    // 0x02: display PLMN only;
    // 0x03: display both PLMN and SPN;
    switch (this.Control_Display_SPN_And_PLMN) {
      case 0x00:
        if (operator && iccInfo && iccInfo.isDisplaySpnRequired &&
          iccInfo.spn) {
          if (iccInfo.isDisplayNetworkNameRequired) {
            operator = operator + ' ' + iccInfo.spn;
          } else {
            operator = iccInfo.spn;
          }
        }
        break;
      case 0x01:
        if (operator && iccInfo && iccInfo.isDisplaySpnRequired &&
          iccInfo.spn) {
          operator = iccInfo.spn;
        }
        break;
      case 0x02:
        break;
      case 0x03:
        if (operator && iccInfo && iccInfo.isDisplaySpnRequired &&
          iccInfo.spn) {
          operator = operator + ' ' + iccInfo.spn;
        }
        break;
      default :
        if (operator && iccInfo && iccInfo.isDisplaySpnRequired &&
          iccInfo.spn) {
          if (iccInfo.isDisplayNetworkNameRequired) {
            operator = operator + ' ' + iccInfo.spn;
          } else {
            operator = iccInfo.spn;
          }
        }
    }
    // tcl_longxiuping add for bug 753648 end.

    var carrier, region;

    // tcl_longxiuping remove for bug 708139, 759498, 678090, 747448 begin.
    /*
    if (this.isBrazil(mobileConnection)) {
      // We are in Brazil, It is legally required to show local info
      // about current registered GSM network in a legally specified way.
      var lac = mobileConnection.voice.cell.gsmLocationAreaCode % 100;
      var carriers = MobileInfo.brazil.carriers;
      var regions = MobileInfo.brazil.regions;

      carrier = carriers[network.mnc] ||
                (this.BRAZIL_MCC + network.mnc);
      region = (regions[lac] ? regions[lac] + ' ' + lac : '');
    }
    */
    // tcl_longxiuping remove for bug 708139, 759498, 678090, 747448 end.

    return {
      'operator': operator,
      'carrier': carrier,
      'region': region
    };
  },

  isBrazil: function mo_isBrazil(mobileConnection) {
    var cell = mobileConnection.voice.cell;
    var net = mobileConnection.voice.network;
    return net ?
           (net.mcc === this.BRAZIL_MCC && cell && cell.gsmLocationAreaCode) :
           null;
  },

  // tcl_longxiuping add for bug 753648 begin.
  getControlValue: function mo_getControlValue() {
    var self = this;
    var key = 'control-display-spn-and-plmn';

    var request = navigator.mozSettings.createLock().get(key);
    request.onsuccess = function() {
      var value = request.result[key];
      self.Control_Display_SPN_And_PLMN = value || 0x00;
      dump('lxp:: Control_Display_SPN_And_PLMN : ' + value);
    };

    request.onerror = function() {
      console.log('Error retrieving control-display-spn-and-plmn');
    };
  }
  // tcl_longxiuping add for bug 753648 end.
};

// tcl_longxiuping add for bug 753648.
MobileOperator.getControlValue();

var MobileInfo = {
  brazil: {
    carriers: {
      '00': 'NEXTEL',
      '02': 'TIM', '03': 'TIM', '04': 'TIM',
      '05': 'CLARO', '06': 'VIVO', '07': 'CTBC', '08': 'TIM',
      '10': 'VIVO', '11': 'VIVO', '15': 'SERCOMTEL',
      '16': 'OI', '23': 'VIVO', '24': 'OI', '31': 'OI',
      '32': 'CTBC', '33': 'CTBC', '34': 'CTBC', '37': 'AEIOU'
    },
    regions: {
      '11': 'SP', '12': 'SP', '13': 'SP', '14': 'SP', '15': 'SP', '16': 'SP',
      '17': 'SP', '18': 'SP', '19': 'SP',
      '21': 'RJ', '22': 'RJ', '24': 'RJ',
      '27': 'ES', '28': 'ES',
      '31': 'MG', '32': 'MG', '33': 'MG', '34': 'MG', '35': 'MG', '37': 'MG',
      '38': 'MG',
      '41': 'PR', '42': 'PR', '43': 'PR', '44': 'PR', '45': 'PR', '46': 'PR',
      '47': 'SC', '48': 'SC', '49': 'SC',
      '51': 'RS', '53': 'RS', '54': 'RS', '55': 'RS',
      '61': 'DF',
      '62': 'GO',
      '63': 'TO',
      '64': 'GO',
      '65': 'MT', '66': 'MT',
      '67': 'MS',
      '68': 'AC',
      '69': 'RO',
      '71': 'BA', '73': 'BA', '74': 'BA', '75': 'BA', '77': 'BA',
      '79': 'SE',
      '81': 'PE',
      '82': 'AL',
      '83': 'PB',
      '84': 'RN',
      '85': 'CE',
      '86': 'PI',
      '87': 'PE',
      '88': 'CE',
      '89': 'PI',
      '91': 'PA',
      '92': 'AM',
      '93': 'PA', '94': 'PA',
      '95': 'RR',
      '96': 'AP',
      '97': 'AM',
      '98': 'MA', '99': 'MA'
    }
  }
};
