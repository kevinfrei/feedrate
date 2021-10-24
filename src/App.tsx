import React from 'react';
import './App.css';

import {
  ChoiceGroup,
  Dropdown,
  IChoiceGroupOption,
  IDropdownOption,
  Slider,
  TextField,
} from '@fluentui/react';

function ddo<T>(
  data: T,
  key: string | number,
  text?: string,
): IDropdownOption<T> {
  return text !== undefined
    ? { key, text, data }
    : { key, text: key.toString(), data };
}

const styles = { root: { flexGrow: 1 } };
const unitOptions: IChoiceGroupOption[] = [
  { text: 'mm', key: 'mm', styles },
  { text: 'inches', key: 'inch', styles },
];

const machineDefault = 0;
const machineOptions: IDropdownOption<number>[] = [
  ddo(2, 'PowerRoute'), // Default, cuz that's what I own
  ddo(1, 'M3'),
  ddo(0.7, 'CarveKing'),
  ddo(1.7, 'MegaV'),
];

const cutWidthDefault = 1;
const cutWidthOptions: IDropdownOption<number>[] = [
  ddo(0, '1/16"'),
  ddo(1, '1/8"'), // Default
  ddo(2, '3/16"'),
  ddo(3, '1/4"'),
  ddo(0, '2mm'),
  ddo(1, '3mm'),
  ddo(2, '5mm'),
  ddo(3, '6mm'),
];

const fluteDefault = 1;
const fluteOptions: IDropdownOption<number>[] = [
  ddo(1, 1),
  ddo(2, 2), // Default
  ddo(3, 3),
  ddo(4, 4),
];

const aggressionDefault = 1;
const aggressionOptions: IDropdownOption<number>[] = [
  ddo(0.5, 'Conservative'),
  ddo(1, 'Normal'), // Default
  ddo(1.33, 'Aggressive'),
];

type IMaterialData = {
  feedRate: [number, number, number, number];
  depth: [number, number, number, number];
  frMult: Map<string | number, number>;
};

const materialDefault = 2;
const materialOptions: IDropdownOption<IMaterialData>[] = [
  ddo(
    {
      feedRate: [0.0007, 0.0009, 0.001, 0.0011],
      depth: [0.012, 0.018, 0.0175, 0.0175],
      frMult: new Map<string, number>([['PowerRoute', 1.6]]),
    },
    'Aluminum (6061)',
  ),
  ddo(
    {
      feedRate: [0.0015, 0.002, 0.0023, 0.0027],
      depth: [0.05, 0.065, 0.075, 0.075],
      frMult: new Map<string, number>([['PowerRoute', 2]]),
    },
    'Hard Plastic (i.e. acrylic, pvc)',
  ),
  ddo(
    {
      feedRate: [0.0012, 0.0016, 0.002, 0.0023],
      depth: [0.04, 0.06, 0.08, 0.08],
      frMult: new Map<string, number>([['PowerRoute', 2]]),
    },
    'Hardwood (i.e. maple, oak, walnut)',
  ),
  ddo(
    {
      feedRate: [0.0018, 0.002, 0.0023, 0.0027],
      depth: [0.08, 0.12, 0.16, 0.17],
      frMult: new Map<string, number>([['PowerRoute', 2]]),
    },
    'MDF',
  ),
  ddo(
    {
      feedRate: [0.0016, 0.002, 0.0023, 0.0025],
      depth: [0.06, 0.07, 0.08, 0.08],
      frMult: new Map<string, number>([['PowerRoute', 2]]),
    },
    'Soft Plastic (i.e. abs, styrofoam)',
  ),
  ddo(
    {
      feedRate: [0.0016, 0.0022, 0.0024, 0.0028],
      depth: [0.06, 0.1, 0.14, 0.16],
      frMult: new Map<string, number>([['PowerRoute', 2]]),
    },
    'Softwood (i.e. pine, cedar, fir)',
  ),
];

function trim(str: number, acc: number): string {
  const val = str.toFixed(acc);
  if (val.indexOf('.') > -1) {
    for (let i = val.length - 1; i > 0; i--) {
      if (val[i] !== '0') {
        return val.substring(0, val[i] === '.' ? i : i + 1);
      }
    }
  }
  return val;
}

function App() {
  // All the 'input' state of the calculator
  const [machine, setMachine] = React.useState(machineDefault);
  const [unit, setUnit] = React.useState<'mm' | 'inch'>('mm');
  const [cutWidth, setcutWidth] = React.useState(cutWidthDefault);
  const [numFlutes, setNumFlutes] = React.useState(fluteDefault);
  const [aggression, setAggression] = React.useState(aggressionDefault);
  const [material, setMaterial] = React.useState(materialDefault);
  const [rpmValue, setRPMval] = React.useState(15000);

  let feedRate = 0;
  let depthOfCut = 0;
  let chipLoad = 0;
  if (
    machine !== undefined &&
    aggression !== undefined &&
    cutWidth !== undefined &&
    material !== undefined &&
    numFlutes !== undefined
  ) {
    const materialData = materialOptions[material].data;
    const cutterNumber = cutWidthOptions[cutWidth].data;
    const fluteCount = fluteOptions[numFlutes].key as number;
    const machineFactor = machineOptions[machine].data;
    const machineKey = machineOptions[machine].key;
    const aggressionFactor = aggressionOptions[aggression].data;
    if (
      materialData !== undefined &&
      cutterNumber !== undefined &&
      machineFactor !== undefined &&
      aggressionFactor !== undefined
    ) {
      const unitScale = unit === 'mm' ? 25.4 : 1;
      feedRate = materialData.feedRate[cutterNumber] * rpmValue * fluteCount;
      // Check for a machine-specific multiplier override
      const multiplier = materialData.frMult.get(machineKey) || 1;
      feedRate = Math.min(320, feedRate * multiplier) * unitScale;
      depthOfCut =
        materialData.depth[cutterNumber] *
        machineFactor *
        aggressionFactor *
        unitScale;
      chipLoad = (feedRate / (rpmValue * fluteCount)) * unitScale;
    }
  }
  function dd<T>(
    label: string,
    options: IDropdownOption<T>[],
    val: number,
    change: (option: number) => void,
  ) {
    return (
      <div className="divRow">
        <div className="divCell">{label}</div>
        <div className="divCell">
          <Dropdown
            defaultSelectedKey={options[val].key}
            placeholder={label}
            options={options}
            onChange={(_ev, _itm, index) =>
              index !== undefined && change(index)
            }
            selectedKey={options[val].key}
          />
        </div>
      </div>
    );
  }
  function dt(label: string, val: number, digits: number, suffix: string) {
    return (
      <div className="divRow">
        <div className="divCell">{label}</div>
        <div className="divCell">
          <TextField readOnly value={trim(val, digits) + ' ' + suffix} />
        </div>
      </div>
    );
  }

  return (
    <div className="center-screen">
      <div>
        <div className="header">Feed Rate Calculator</div>
        <div className="divTable">
          {dd('Select a machine', machineOptions, machine, setMachine)}
          {dd('Cutter Diameter', cutWidthOptions, cutWidth, setcutWidth)}
          {dd('# of Flutes', fluteOptions, numFlutes, setNumFlutes)}
          {dd('Aggression', aggressionOptions, aggression, setAggression)}
          {dd('Material', materialOptions, material, setMaterial)}
          <div className="divRow">
            <div className="divCell">RPM</div>
            <div className="divCell">
              <Slider
                min={800}
                max={25000}
                value={rpmValue}
                onChange={setRPMval}
              />
            </div>
          </div>
          <div className="divRow">
            <div className="divCell">OutputUnits</div>
            <div className="divCell">
              <ChoiceGroup
                styles={{
                  flexContainer: { display: 'flex' },
                  root: { display: 'inline' },
                }}
                selectedKey={unit}
                options={unitOptions}
                onChange={(_ev: any, option?: IChoiceGroupOption) => {
                  option && setUnit(option.key === 'mm' ? 'mm' : 'inch');
                }}
              />
            </div>
          </div>
          {dt('Feed Rate', feedRate, 4, unit + '/min')}
          {dt('Depth of Cut', depthOfCut, 4, unit)}
          {dt('Chip Load', chipLoad, 6, unit)}
        </div>
      </div>
    </div>
  );
}

export default App;
