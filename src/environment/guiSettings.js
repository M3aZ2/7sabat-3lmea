import GUI from 'lil-gui'

export function createGUI(settings,updateCallback) {
    const gui = new GUI({title:"Settings"})
    const genSetGUI=gui.addFolder('General Settings')

    const followMeteorController=genSetGUI
        .add(settings,'followMeteor')

    const speedController=genSetGUI
        .add(settings,'speed')
        .min(0)
        .max(20)
        .step(0.25)
        .onFinishChange(updateCallback.speedUpdate)
    const metSetGUI=gui.addFolder('Meteor Settings')
    const meteorTypeController=metSetGUI
        .add(settings,'meteorType',
        [ 'rock','ice','copper'])
        .name('Meteor Type')
        .onFinishChange(()=>{updateCallback.updateMeteorType(settings.meteorType)})

    const speedMeteorController=metSetGUI
        .add(settings,'meteorSpeed')
        .min(0)
        .step(0.25)
    const meteorTemperatureController=metSetGUI
        .add(settings,'meteorTemperature')
    const meteorRadiusController=metSetGUI
        .add(settings,'meteorRadius')
        .min(0)
        .max(25)
        .onChange(updateCallback.meteorRadiusUpdate)
    const lunchController=gui
        .add(settings,'lunch')

    const updateControllersDisplay=()=>
    {
        meteorTemperatureController.updateDisplay()
        speedMeteorController.updateDisplay()
        meteorRadiusController.updateDisplay()
    }
    const disableGui=()=>{
        speedController.disable()
        followMeteorController.disable()
        meteorTypeController.disable()
        genSetGUI.close()
        speedMeteorController.disable()
        meteorTemperatureController.disable()
        meteorRadiusController.disable()
        lunchController.disable()
    }
    return ({
        gui,
        updateControllersDisplay,
        disableGui})
}