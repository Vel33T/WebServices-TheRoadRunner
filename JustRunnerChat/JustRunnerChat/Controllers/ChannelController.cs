using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using JustRunnerChat.Model;
using JustRunnerChat.Data;
using JustRunnerChat.Models;
using JustRunnerChat.Repositories;

namespace JustRunnerChat.Controllers
{
    public class ChannelController : BaseApiController
    {
        [HttpPost]
        [ActionName("create")]
        public HttpResponseMessage CreateChannel(ChannelCreateModel channelModel)
        {
            var responseMsg = this.PerformOperation(() =>
            {
                ChannelsRepository.CreateChannel(channelModel.Name, channelModel.Nickname, channelModel.Password);
            });

            return responseMsg;
        }

        [HttpPost]
        [ActionName("join")]
        public HttpResponseMessage JoinChannel(ChannelJoinModel channelModel)
        {
            var responseMsg = this.PerformOperation(() =>
            {
                ChannelsRepository.JoinChannel(channelModel.Name, channelModel.Nickname, channelModel.Password);
            });

            return responseMsg;
        }

        [HttpPost]
        [ActionName("exit")]
        public HttpResponseMessage ExitChannel(ChannelExitModel channelModel)
        {
            var responseMsg = this.PerformOperation(() =>
            {
                ChannelsRepository.ExitChannel(channelModel.Name, channelModel.Nickname);
            });

            return responseMsg;
        }

        [HttpPost]
        [ActionName("add-message")]
        public HttpResponseMessage AddMessage(ChannelAddMessageModel channelModel)
        {
            var responseMsg = this.PerformOperation(() =>
            {
                ChannelsRepository.AddMessage(channelModel.Name, channelModel.Nickname, channelModel.Message);
            });

            return responseMsg;
        }
    }
}