import React, {useMemo, useState} from 'react'
import {connect} from 'react-redux'

import {
  getSelections,
  getSceneObjects,
  updateObject
} from './../../../shared/reducers/shot-generator'

import deepEqualSelector from './../../../utils/deepEqualSelector'

import {Tabs, Tab, Panel} from '../Tabs'

import GeneralInspector from './GeneralInspector/index'
import HandInspector from './HandInspector/HandPresetsEditor/index'
import PosePresetsInspector from './PosePresetsInspector/index'
import ModelInspector from './ModelInspector/index'
import AttachableInspector from './AttachableInspector/index'
import { useTranslation } from 'react-i18next'
import Icon from '../Icon'
import Modal from '../Modal'

const isChar = (type) => type === 'character'
const isObj = (type) => type === 'object'
const nullTab = {tab: null, panel: null}

const Inspector = React.memo(({id, selectedName, selectedType, updateObject}) => {
  const { t } = useTranslation()
  const [isModalShown, showModal] = useState(false)
  const [changedName, changeNameTo] = useState(false)
  const handPoseTab = useMemo(() => {
    if (!isChar(selectedType)) return nullTab

    return {
      tab: <Tab><Icon src='icon-tab-hand'/></Tab>,
      panel: <Panel><HandInspector/></Panel>
    }
  }, [selectedType])

  const charPoseTab = useMemo(() => {
    if (!isChar(selectedType)) return nullTab

    return {
      tab: <Tab><Icon src='icon-tab-pose'/></Tab>,
      panel: <Panel><PosePresetsInspector/></Panel>
    }
  }, [selectedType])

  const modelTab = useMemo(() => {
    if (!isChar(selectedType) && !isObj(selectedType)) return nullTab

    return {
      tab: <Tab><Icon src='icon-tab-model'/></Tab>,
      panel: <Panel><ModelInspector/></Panel>
    }
  }, [selectedType])

  const attachmentTab = useMemo(() => {
    if (!isChar(selectedType)) return nullTab

    return {
      tab: <Tab><Icon src='icon-tab-attachable'/></Tab>,
      panel: <Panel><AttachableInspector/></Panel>
    }
  }, [selectedType])


  return (
    <React.Fragment>
      { isModalShown && <Modal visible={ isModalShown } onClose={() => showModal(false)}>
        <div style={{ margin:"5px 5px 5px 5px" }}>
        {t("shot-generator.inspector.common.select-preset-name")}
        </div>
        <div className="column" style={{ flex: 1}}>
          <input
            className="modalInput"
            type="text"
            placeholder={ selectedName }
            onChange={ (value) => changeNameTo(value.currentTarget.value) }/>
        </div>
        <div className="skeleton-selector__div">
          <button
            className="skeleton-selector__button"
            onClick={() => {
              showModal(false)
              updateObject(id, { displayName: changedName, name: changedName })
            }}>
                {t("shot-generator.inspector.common.proceed-button")}
          </button>
      </div>
      </Modal> }
      <a href="#" className="object-property-heading" style={{ overflow: "hidden", textOverflow: "ellipsis", flexShrink:0, width: 288 }} onClick={ () => showModal(true) }>
        {selectedName} {t("shot-generator.inspector.inspected-element.properties")}
      </a>
      <Tabs key={id}>
        <div className="tabs-header">
          <Tab><Icon src="icon-tab-parameters"/></Tab>
          {handPoseTab.tab}
          {charPoseTab.tab}
          {modelTab.tab}
          {attachmentTab.tab}
        </div>

        <div className="tabs-body">
          <Panel><GeneralInspector/></Panel>
          {handPoseTab.panel}
          {charPoseTab.panel}
          {modelTab.panel}
          {attachmentTab.panel}
        </div>
      </Tabs>
    </React.Fragment>
  )
})

const getObjectInfo = (state) => {
  const selected = getSelections(state)[0]
  const object = getSceneObjects(state)[selected]

  if (!object) {
    return null
  }

  return {
    id: selected,
    selectedName: object.name || object.displayName,
    selectedType: object.type
  }
}

const getObjectInfoM = deepEqualSelector([getObjectInfo], (info) => info)

const mapStateToProps = (state) => getObjectInfoM(state)

const mapDispatchToProps = {
  updateObject,
}

export default connect(mapStateToProps, mapDispatchToProps)(Inspector)
