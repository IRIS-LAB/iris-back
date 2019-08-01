import { Injectable } from '@nestjs/common'
import { CommandBE } from '../../objects/business/be/CommandBE'
import { CommandLineBE } from '../../objects/business/be/CommandLineBE'

@Injectable()
export class AmountCalculator {

  public calculateCommandAmount(command: CommandBE): void {
    command.amount = command && command.commandLines ?
      command.commandLines.reduce((sum: number, ligneCommande: CommandLineBE) => {
        this.calculateCommandLineAmount(ligneCommande)
        return sum + ligneCommande.amount!
      }, 0)
      : 0
  }

  private calculateCommandLineAmount(ligneCommande: CommandLineBE): void {
    ligneCommande.amount = ligneCommande.product.amount * ligneCommande.quantity
  }
}
