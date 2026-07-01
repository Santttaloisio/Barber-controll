import { Request, Response } from 'express'
import { Cut, Barber, Service } from '../models'

export const getCuts = async (req: Request, res: Response) => {
    try {
        const cuts = await Cut.findAll({
            include:[Barber,Service],
            order:[['fecha', 'DESC']]
        })

        res.json(cuts)
    } catch (error) {
        res.status(500).json ({
            message: 'Error al obtener los cortes',
            error
        })
    }
}

export const createCut = async (req: Request, res: Response) => {
  try {
    const { barberId, serviceId, monto, metodoPago, observacion } = req.body

    if (!barberId || !serviceId || !monto || !metodoPago) {
      return res.status(400).json({
        message: 'Faltan datos obligatorios'
      })
    }

    const newCut = await Cut.create({
      barberId,
      serviceId,
      monto,
      metodoPago,
      observacion
    })

    res.status(201).json({
      message: 'Corte registrado correctamente',
      cut: newCut
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error al registrar el corte, intente de nuevo.',
      error
    })
  }
}