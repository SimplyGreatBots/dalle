import axios from 'axios'
import { buildApiData, validateResponse, getApiConfig } from './client'
import * as bp from '.botpress'
import * as sdk from '@botpress/sdk'

type GenerateImageOutput = bp.actions.generateImage.output.Output

export default new bp.Integration({
  register: async () => {},
  unregister: async () => {},
  actions: {
    generateImage: async (args): Promise<GenerateImageOutput> => {
      args.logger.forBot().info('Generating Image')

      const { apiUrl, headers } = getApiConfig(args)
      const data = buildApiData(args)

      try {
        const response = await axios.post(apiUrl, data, { headers })
        validateResponse(response)

        const image = response.data.data[0].url
        const createdDate = response.data.created.toString()

        return { url: image, createdDate }
      } catch (error: any) {
        if (axios.isAxiosError(error)) {
          if (error.response) {
              const errorCode = error.response.data.error.code;
              const errorMessage = error.response.data.error.message;
              const formattedError = `Error: ${errorCode} - ${errorMessage}`;
  
              args.logger.forBot().error(`HTTP Error: ${error.response.status} - ${formattedError}`);
              throw new sdk.RuntimeError(formattedError, error)
              
          } else if (error.request) {
              args.logger.forBot().error('No response received from API');
              throw new sdk.RuntimeError('No response from API', error);
          } 
      } else {
          args.logger.forBot().error('Unexpected error:', error.message);
          throw new sdk.RuntimeError('Unexpected error during API call', error);
      }
      return { url: '', createdDate: '' }
    }
    },
  },
  channels: {},
  handler: async () => {},
})