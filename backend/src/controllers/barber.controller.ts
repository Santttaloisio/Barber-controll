import { Request, Response } from 'express'
import { Barber } from '../models'

export const getBarbers = async (req: Request, res: Response) => {
  try {
    const barbers = await Barber.findAll({
      where: {
        activo: true
      },
      order: [['id', 'ASC']]
    })

    res.json(barbers)
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener los barberos',
      error
    })
  }
}

export const createBarber = async (req: Request, res: Response) => {
  try {
    const { nombre } = req.body

    const cleanName = String(nombre ?? '').trim()

    if (!cleanName) {
      return res.status(400).json({
        message: 'El nombre es obligatorio'
      })
    }

    const normalizedName = cleanName.toLowerCase()

    const allBarbers = await Barber.findAll()

    const existingBarber = allBarbers.find((barber: any) => {
      const barberName = String(barber.get('nombre') ?? '').trim().toLowerCase()

      return barberName === normalizedName
    })

    if (existingBarber) {
      const isActive = Boolean(existingBarber.get('activo'))

      if (isActive) {
        return res.status(400).json({
          message: 'Ya existe un barbero activo con ese nombre'
        })
      }

      await existingBarber.update({
        activo: true,
        nombre: cleanName
      })

      return res.json({
        message: 'Barbero reactivado correctamente',
        barber: existingBarber
      })
    }

    const newBarber = await Barber.create({
      nombre: cleanName,
      activo: true
    })

    res.status(201).json({
      message: 'Barbero creado correctamente',
      barber: newBarber
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear el barbero',
      error
    })
  }
}

export const deleteBarber = async (req: Request, res: Response) => {
  try {
    const barberId = Number(req.params.id)

    if (!Number.isInteger(barberId) || barberId <= 0) {
      return res.status(400).json({
        message: 'El id del barbero no es válido'
      })
    }

    const barber = await Barber.findByPk(barberId)

    if (!barber) {
      return res.status(404).json({
        message: 'Barbero no encontrado'
      })
    }

    await barber.update({
      activo: false
    })

    res.json({
      message: 'Barbero eliminado correctamente'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error al eliminar el barbero',
      error
    })
  }
}