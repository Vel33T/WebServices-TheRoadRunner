using System;
using System.Linq;
using System.Net.Http;
using System.Web.Http;
using JustRunnerChat.Models;
using JustRunnerChat.Repositories;
using System.Collections.Generic;
using JustRunnerChat.Model;

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

        [HttpGet]
        [ActionName("get-history")]
        public HttpResponseMessage GetHistory(string channelName)
        {
            var responseMsg = this.PerformOperation(() =>
            {
                var history = ChannelsRepository.GetHistory(channelName);
                return history;
            });

            return responseMsg;
        }
    }
}