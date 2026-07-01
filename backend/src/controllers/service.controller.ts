import { Request, Response } from 'express'
import { Service, Cut } from '../models'

export const getServices = async (req: Request, res: Response) => {
  try {
    const services = await Service.findAll({
      order: [['id', 'ASC']]
    })

    res.json(services)
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener los servicios',
      error
    })
  }
}

export const createService = async (req: Request, res: Response) => {
  try {
    const { nombre, precioBase } = req.body

    if (!nombre || !precioBase) {
      return res.status(400).json({
        message: 'El nombre y el precio base son obligatorios'
      })
    }

    const newService = await Service.create({
      nombre,
      precioBase
    })

    res.status(201).json({
      message: 'Servicio creado correctamente',
      service: newService
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear el servicio',
      error
    })
  }
}

export const updateServicePrice = async (req: Request, res: Response) => {
  try {
    const serviceId = Number(req.params.id)
    const { precioBase } = req.body

    if (!Number.isInteger(serviceId) || serviceId <= 0) {
      return res.status(400).json({
        message: 'El id del servicio no es válido'
      })
    }

    const priceNumber = Number(precioBase)

    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      return res.status(400).json({
        message: 'El precio no es válido'
      })
    }

    const service = await Service.findByPk(serviceId)

    if (!service) {
      return res.status(404).json({
        message: 'Servicio no encontrado'
      })
    }

    await service.update({
      precioBase: priceNumber
    })

    res.json({
      message: 'Precio actualizado correctamente',
      service
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar el precio del servicio',
      error
    })
  }
}

export const deleteService = async (req: Request, res: Response) => {
  try {
    const serviceId = Number(req.params.id)

    if (!Number.isInteger(serviceId) || serviceId <= 0) {
      return res.status(400).json({
        message: 'El id del servicio no es válido'
      })
    }

    const service = await Service.findByPk(serviceId)

    if (!service) {
      return res.status(404).json({
        message: 'Servicio no encontrado'
      })
    }

    const cutsCount = await Cut.count({
      where: {
        serviceId
      }
    })

    if (cutsCount > 0) {
      return res.status(400).json({
        message: 'No se puede borrar el servicio porque ya tiene cortes registrados'
      })
    }

    await service.destroy()

    res.json({
      message: 'Servicio eliminado correctamente'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error al eliminar el servicio',
      error
    })
  }
}