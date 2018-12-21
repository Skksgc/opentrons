// @flow
import * as React from 'react'
import {connect} from 'react-redux'
import assert from 'assert'
import {removeWellsContents, setWellContents} from '../../labware-ingred/actions'
import {selectors as labwareIngredSelectors} from '../../labware-ingred/reducers'
import type {Wells} from '../../labware-ingred/types'
import * as wellContentsSelectors from '../../top-selectors/well-contents'
import LiquidPlacementForm from './LiquidPlacementForm'
import type {Dispatch} from 'redux'
import type {ValidFormValues} from './LiquidPlacementForm'
import type {BaseState} from '../../types'

type Props = React.ElementProps<typeof LiquidPlacementForm>

type OP = {
  selectedWells: Wells,
  deselectAll: () => mixed,
}
type DP = {
  cancelForm: $PropertyType<Props, 'cancelForm'>,
  clearWells: $PropertyType<Props, 'clearWells'>,
  saveForm: $PropertyType<Props, 'saveForm'>,
}

type SP = $Diff<Props, DP> & {
  _labwareId: ?string,
  _selectedWells: ?Array<string>,
  _selectionHasLiquids: boolean,
}

function mapStateToProps (state: BaseState, ownProps: OP): SP {
  const _selectedWells = Object.keys(ownProps.selectedWells || {})

  const _labwareId = labwareIngredSelectors.getSelectedLabwareId(state)
  const liquidLocations = labwareIngredSelectors.getLiquidsByLabwareId(state)
  const _selectionHasLiquids = Boolean(
    _labwareId &&
    liquidLocations[_labwareId] &&
    _selectedWells.some(well => liquidLocations[_labwareId][well])
  )

  return {
    liquidSelectionOptions: labwareIngredSelectors.getLiquidSelectionOptions(state),
    showForm: _selectedWells.length > 0,
    selectedWellsMaxVolume: wellContentsSelectors.getSelectedWellsMaxVolume(state),

    _labwareId,
    _selectedWells,
    _selectionHasLiquids,
  }
}

function mergeProps (stateProps: SP, dispatchProps: {dispatch: Dispatch<*>}, ownProps: OP): Props {
  const {_labwareId, _selectedWells, _selectionHasLiquids, ...passThruProps} = stateProps
  const {dispatch} = dispatchProps

  const clearWells = (_labwareId && _selectedWells && _selectionHasLiquids)
    ? () => {
      // TODO: Ian 2018-10-22 replace with modal later on if we like this UX
      if (global.confirm('Are you sure you want to remove liquids from all selected wells?')) {
        dispatch(removeWellsContents({
          labwareId: _labwareId,
          wells: _selectedWells,
        }))
        ownProps.deselectAll()
      }
    }
    : null

  return {
    ...passThruProps,
    commonSelectedLiquidId: ownProps.commonSelectedLiquidId,
    commonSelectedVolume: ownProps.commonSelectedVolume,
    cancelForm: ownProps.deselectAll,
    clearWells,
    saveForm: (values: ValidFormValues) => {
      const volume = Number(values.volume)

      assert(
        _labwareId != null,
        'when saving liquid placement form, expected a selected labware ID')
      assert(
        _selectedWells && _selectedWells.length > 0,
        `when saving liquid placement form, expected selected wells to be array with length > 0 but got ${String(_selectedWells)}`)
      assert(
        volume > 0,
        `when saving liquid placement form, expected volume > 0, got ${volume}`)

      if (_labwareId != null) {
        dispatch(setWellContents({
          liquidGroupId: values.selectedLiquidId,
          labwareId: _labwareId,
          wells: _selectedWells || [],
          volume: Number(values.volume),
        }))
        ownProps.deselectAll()
      }
    },
  }
}

export default connect(mapStateToProps, null, mergeProps)(LiquidPlacementForm)
